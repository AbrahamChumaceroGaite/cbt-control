import { ICommandHandler, CommandHandler }    from '@nestjs/cqrs'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { PointRepository }    from '../../domain/point.repository'
import { CoinLogMapper }      from '../coin-log.mapper'
import { NotificationService } from '../../../push/application/notification.service'
import type { CoinLogResponse } from '@control-aula/shared'

export class AwardCoinsDto {
  @IsString()  @IsNotEmpty()  courseId!:   string
  @IsOptional() @IsString()   studentId?:  string
  @IsOptional() @IsString()   actionId?:   string
  @IsNumber()                 coins!:      number
  @IsString()  @IsNotEmpty()  reason!:     string
}

export class AwardCoinsCommand {
  constructor(public readonly dto: AwardCoinsDto) {}
}

@CommandHandler(AwardCoinsCommand)
export class AwardCoinsHandler implements ICommandHandler<AwardCoinsCommand, CoinLogResponse> {
  constructor(
    private readonly repo:          PointRepository,
    private readonly notifications: NotificationService,
  ) {}

  async execute({ dto }: AwardCoinsCommand): Promise<CoinLogResponse> {
    const log = await this.repo.awardCoins(dto)

    // Fire-and-forget: push notification must not affect the transactional result
    if (dto.studentId) {
      this.notifications.notifyCoinsAwarded(dto.studentId, dto.coins, dto.reason).catch(() => {})
    }

    return CoinLogMapper.toResponse(log)
  }
}
