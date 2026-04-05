import { Injectable, Logger } from '@nestjs/common'
import { PrismaService }      from '../../../infrastructure/prisma/prisma.service'
import { PushRepository }     from '../domain/push.repository'
import { PushSenderService }  from '../infrastructure/push-sender.service'
import { InboxRepository }    from '../../inbox/domain/inbox.repository'
import { SocketService }    from '../../../infrastructure/socket/socket.service'
import type { NotificationPayload } from '../../inbox/domain/notification.entity'

/**
 * Application-layer orchestrator.
 * For every notification event it:
 *   1. Persists an inbox record for each recipient (always — push optional)
 *   2. Sends a Web Push notification to subscribed devices (when VAPID configured)
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    private readonly pushRepo:  PushRepository,
    private readonly sender:    PushSenderService,
    private readonly prisma:    PrismaService,
    private readonly inbox:     InboxRepository,
    private readonly realtime:  SocketService,
  ) {}

  /** Notify the student linked to studentId that coins were awarded/deducted. */
  async notifyCoinsAwarded(studentId: string, coins: number, reason: string): Promise<void> {
    try {
      const user = await this.prisma.user.findFirst({ where: { studentId }, select: { id: true } })
      if (!user) return

      const payload: NotificationPayload = {
        title: `${coins >= 0 ? '+' : ''}${coins} coins`,
        body:  reason,
        url:   '/portal',
        tag:   'coins',
      }

      const item = await this.inbox.create(user.id, payload)
      this.realtime.notificationForStudent(studentId, {
        id: item.id, title: payload.title, body: payload.body, createdAt: item.createdAt.toISOString(),
      })
      await this.#push(user.id, payload)
    } catch (err: any) {
      this.logger.error(`notifyCoinsAwarded: ${err?.message}`)
    }
  }

  /** Notify the student that their redemption request was approved or rejected. */
  async notifyRequestProcessed(studentId: string, rewardName: string, approved: boolean): Promise<void> {
    try {
      const user = await this.prisma.user.findFirst({ where: { studentId }, select: { id: true } })
      if (!user) return

      const payload: NotificationPayload = {
        title: approved ? '¡Premio aprobado!' : 'Solicitud rechazada',
        body:  approved
          ? `Tu solicitud de "${rewardName}" fue aprobada`
          : `Tu solicitud de "${rewardName}" fue rechazada`,
        url: '/portal',
        tag: 'solicitud',
      }

      const item = await this.inbox.create(user.id, payload)
      this.realtime.notificationForStudent(studentId, {
        id: item.id, title: payload.title, body: payload.body, createdAt: item.createdAt.toISOString(),
      })
      await this.#push(user.id, payload)
    } catch (err: any) {
      this.logger.error(`notifyRequestProcessed: ${err?.message}`)
    }
  }

  /** Notify all active admins that a student submitted a new redemption request. */
  async notifyAdminsNewRequest(studentId: string, rewardId: string, requestId = ''): Promise<void> {
    try {
      const [student, reward, adminUsers] = await Promise.all([
        this.prisma.student.findUnique({ where: { id: studentId }, select: { name: true } }),
        this.prisma.reward.findUnique({  where: { id: rewardId  }, select: { name: true } }),
        this.prisma.user.findMany({ where: { role: 'admin', isActive: true }, select: { id: true } }),
      ])

      if (!adminUsers.length) return

      const payload: NotificationPayload = {
        title: 'Nueva solicitud de canje',
        body:  `${student?.name ?? 'Estudiante'} solicitó "${reward?.name ?? 'un premio'}"`,
        url:   '/',
        tag:   'admin-request',
      }

      const items = await Promise.all(adminUsers.map(u => this.inbox.create(u.id, payload)))

      // Emit solicitud:new and notification:new to all connected admins
      this.realtime.solicitudNew({
        id:          requestId,
        studentName: student?.name ?? 'Estudiante',
        rewardName:  reward?.name  ?? 'un premio',
      })
      if (items[0]) {
        this.realtime.notificationForAdmins({
          id: items[0].id, title: payload.title, body: payload.body, createdAt: items[0].createdAt.toISOString(),
        })
      }

      if (this.sender.enabled) {
        const subs    = await this.pushRepo.findByRole('admin')
        const expired = await this.sender.sendMany(subs, payload)
        if (expired.length) await this.pushRepo.removeExpired(expired)
      }
    } catch (err: any) {
      this.logger.error(`notifyAdminsNewRequest: ${err?.message}`)
    }
  }

  /** Notify all active admins that a student created a new coin transaction. */
  async notifyAdminsNewTransaction(fromStudentId: string, toStudentId: string, amount: number, transactionId: string): Promise<void> {
    try {
      const [from, to, adminUsers] = await Promise.all([
        this.prisma.student.findUnique({ where: { id: fromStudentId }, select: { name: true } }),
        this.prisma.student.findUnique({ where: { id: toStudentId   }, select: { name: true } }),
        this.prisma.user.findMany({ where: { role: 'admin', isActive: true }, select: { id: true } }),
      ])
      if (!adminUsers.length) return

      const payload: NotificationPayload = {
        title: 'Nueva transacción de coins',
        body:  `${from?.name ?? 'Alumno'} quiere enviar ${amount} coins a ${to?.name ?? 'otro alumno'}`,
        url:   '/?tab=transacciones',
        tag:   'transaction',
      }

      const items = await Promise.all(adminUsers.map(u => this.inbox.create(u.id, payload)))
      this.realtime.transactionNew({ id: transactionId, fromStudentName: from?.name ?? '', toStudentName: to?.name ?? '', amount })
      if (items[0]) {
        this.realtime.notificationForAdmins({ id: items[0].id, title: payload.title, body: payload.body, createdAt: items[0].createdAt.toISOString() })
      }
      if (this.sender.enabled) {
        const subs    = await this.pushRepo.findByRole('admin')
        const expired = await this.sender.sendMany(subs, payload)
        if (expired.length) await this.pushRepo.removeExpired(expired)
      }
    } catch (err: any) {
      this.logger.error(`notifyAdminsNewTransaction: ${err?.message}`)
    }
  }

  /** Notify sender and recipient that their transaction was approved or rejected. */
  async notifyTransactionProcessed(fromStudentId: string, toStudentId: string, amount: number, approved: boolean): Promise<void> {
    try {
      const [fromUser, toUser, from, to] = await Promise.all([
        this.prisma.user.findFirst({ where: { studentId: fromStudentId }, select: { id: true } }),
        this.prisma.user.findFirst({ where: { studentId: toStudentId   }, select: { id: true } }),
        this.prisma.student.findUnique({ where: { id: fromStudentId }, select: { name: true } }),
        this.prisma.student.findUnique({ where: { id: toStudentId   }, select: { name: true } }),
      ])

      const senderPayload: NotificationPayload = {
        title: approved ? '¡Transacción aprobada!' : 'Transacción rechazada',
        body:  approved
          ? `Enviaste ${amount} coins a ${to?.name ?? 'otro alumno'} exitosamente`
          : `Tu transacción a ${to?.name ?? 'otro alumno'} fue rechazada — coins reembolsados`,
        url: '/portal?tab=bank',
        tag: 'transaction',
      }

      if (fromUser) {
        const item = await this.inbox.create(fromUser.id, senderPayload)
        this.realtime.notificationForStudent(fromStudentId, { id: item.id, title: senderPayload.title, body: senderPayload.body, createdAt: item.createdAt.toISOString() })
        await this.#push(fromUser.id, senderPayload)
      }

      if (approved && toUser) {
        const recipientPayload: NotificationPayload = {
          title: '¡Recibiste coins!',
          body:  `${from?.name ?? 'Un alumno'} te envió ${amount} coins`,
          url:   '/portal?tab=bank',
          tag:   'transaction',
        }
        const item = await this.inbox.create(toUser.id, recipientPayload)
        this.realtime.notificationForStudent(toStudentId, { id: item.id, title: recipientPayload.title, body: recipientPayload.body, createdAt: item.createdAt.toISOString() })
        await this.#push(toUser.id, recipientPayload)
      }
    } catch (err: any) {
      this.logger.error(`notifyTransactionProcessed: ${err?.message}`)
    }
  }

  /** Internal: send push to a single user's subscribed devices. */
  async #push(userId: string, payload: NotificationPayload): Promise<void> {
    if (!this.sender.enabled) return
    const subs = await this.pushRepo.findByUserId(userId)
    if (!subs.length) return
    const expired = await this.sender.sendMany(subs, payload)
    if (expired.length) await this.pushRepo.removeExpired(expired)
  }
}
