import { Injectable, Logger } from '@nestjs/common'
import { PrismaService }      from '../../../infrastructure/prisma/prisma.service'
import { PushRepository }     from '../domain/push.repository'
import { PushSenderService }  from '../infrastructure/push-sender.service'

/**
 * Application-layer orchestrator: knows WHO to notify and WHAT payload to build.
 * Delegates subscription lookup to PushRepository and delivery to PushSenderService.
 * All methods are fire-and-forget (callers should not await these for transactional correctness).
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    private readonly repo:   PushRepository,
    private readonly sender: PushSenderService,
    private readonly prisma: PrismaService,
  ) {}

  /** Notify a student (by Student.id) that coins were awarded or deducted. */
  async notifyCoinsAwarded(studentId: string, coins: number, reason: string): Promise<void> {
    if (!this.sender.enabled) return
    try {
      const user = await this.prisma.user.findFirst({ where: { studentId }, select: { id: true } })
      if (!user) return
      const subs = await this.repo.findByUserId(user.id)
      if (!subs.length) return
      const expired = await this.sender.sendMany(subs, {
        title: `${coins >= 0 ? '+' : ''}${coins} coins`,
        body:  reason,
        tag:   'coins',
        url:   '/portal',
      })
      if (expired.length) await this.repo.removeExpired(expired)
    } catch (err: any) {
      this.logger.error(`notifyCoinsAwarded failed: ${err?.message}`)
    }
  }

  /** Notify a student (by Student.id) that their redemption request was approved or rejected. */
  async notifyRequestProcessed(studentId: string, rewardName: string, approved: boolean): Promise<void> {
    if (!this.sender.enabled) return
    try {
      const user = await this.prisma.user.findFirst({ where: { studentId }, select: { id: true } })
      if (!user) return
      const subs = await this.repo.findByUserId(user.id)
      if (!subs.length) return
      const expired = await this.sender.sendMany(subs, {
        title: approved ? '¡Premio aprobado!' : 'Solicitud rechazada',
        body:  approved
          ? `Tu solicitud de "${rewardName}" fue aprobada`
          : `Tu solicitud de "${rewardName}" fue rechazada`,
        tag:   'solicitud',
        url:   '/portal',
      })
      if (expired.length) await this.repo.removeExpired(expired)
    } catch (err: any) {
      this.logger.error(`notifyRequestProcessed failed: ${err?.message}`)
    }
  }

  /**
   * Notify all active admins that a student submitted a new redemption request.
   * Accepts IDs — looks up display names internally.
   */
  async notifyAdminsNewRequest(studentId: string, rewardId: string): Promise<void> {
    if (!this.sender.enabled) return
    try {
      const [student, reward, subs] = await Promise.all([
        this.prisma.student.findUnique({ where: { id: studentId }, select: { name: true } }),
        this.prisma.reward.findUnique({  where: { id: rewardId  }, select: { name: true } }),
        this.repo.findByRole('admin'),
      ])
      if (!subs.length) return
      const expired = await this.sender.sendMany(subs, {
        title: 'Nueva solicitud de canje',
        body:  `${student?.name ?? 'Estudiante'} solicitó "${reward?.name ?? 'un premio'}"`,
        tag:   'admin-request',
        url:   '/',
      })
      if (expired.length) await this.repo.removeExpired(expired)
    } catch (err: any) {
      this.logger.error(`notifyAdminsNewRequest failed: ${err?.message}`)
    }
  }
}
