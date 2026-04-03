import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { IsNotEmpty, IsString }           from 'class-validator'
import { PortalRepository }               from '../../domain/portal.repository'
import { NotificationService }            from '../../../push/application/notification.service'

export class RequestRewardDto {
  @IsString() @IsNotEmpty() rewardId!: string
}

export class RequestRewardCommand {
  constructor(public readonly studentId: string, public readonly dto: RequestRewardDto) {}
}

@CommandHandler(RequestRewardCommand)
export class RequestRewardHandler implements ICommandHandler<RequestRewardCommand, { id: string; status: string }> {
  constructor(
    private readonly repo:          PortalRepository,
    private readonly notifications: NotificationService,
  ) {}

  async execute({ studentId, dto }: RequestRewardCommand) {
    const result = await this.repo.requestReward(studentId, dto.rewardId)

    // Fire-and-forget: notify all admins about the new pending request
    this.notifications.notifyAdminsNewRequest(studentId, dto.rewardId).catch(() => {})

    return result
  }
}
