import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PortalRepository }               from '../../domain/portal.repository'
import { NotificationService }            from '../../../push/application/notification.service'
import { RequestRewardCommand }           from './request-reward.command'
import { LogService }                     from '../../../../common/logging/log.service'

@CommandHandler(RequestRewardCommand)
export class RequestRewardHandler implements ICommandHandler<RequestRewardCommand, { id: string; status: string }> {
  constructor(
    private readonly repo:          PortalRepository,
    private readonly notifications: NotificationService,
    private readonly log:           LogService,
  ) {}

  async execute({ studentId, dto }: RequestRewardCommand) {
    const result = await this.repo.requestReward(studentId, dto.rewardId)

    // Fire-and-forget: notify all admins (push + inbox + WS)
    this.notifications.notifyAdminsNewRequest(studentId, dto.rewardId, result.id).catch(() => {})
    this.log.module('portal.requestReward', { userId: studentId, result: 'success', meta: { rewardId: dto.rewardId, requestId: result.id } })

    return result
  }
}
