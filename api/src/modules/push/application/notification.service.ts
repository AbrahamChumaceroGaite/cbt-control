import { Injectable, Logger } from '@nestjs/common'
import { PrismaService }      from '../../../infrastructure/prisma/prisma.service'
import { PushRepository }     from '../domain/push.repository'
import { PushSenderService }  from '../infrastructure/push-sender.service'
import { InboxRepository }    from '../../inbox/domain/inbox.repository'
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
    private readonly pushRepo: PushRepository,
    private readonly sender:   PushSenderService,
    private readonly prisma:   PrismaService,
    private readonly inbox:    InboxRepository,
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

      await this.inbox.create(user.id, payload)
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

      await this.inbox.create(user.id, payload)
      await this.#push(user.id, payload)
    } catch (err: any) {
      this.logger.error(`notifyRequestProcessed: ${err?.message}`)
    }
  }

  /** Notify all active admins that a student submitted a new redemption request. */
  async notifyAdminsNewRequest(studentId: string, rewardId: string): Promise<void> {
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

      await Promise.all(adminUsers.map(u => this.inbox.create(u.id, payload)))

      if (this.sender.enabled) {
        const subs    = await this.pushRepo.findByRole('admin')
        const expired = await this.sender.sendMany(subs, payload)
        if (expired.length) await this.pushRepo.removeExpired(expired)
      }
    } catch (err: any) {
      this.logger.error(`notifyAdminsNewRequest: ${err?.message}`)
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
