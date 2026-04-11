import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PointRepository }               from '../../domain/point.repository'
import { CoinLogMapper }                 from '../coin-log.mapper'
import { NotificationService }           from '../../../push/application/notification.service'
import { SocketService }                 from '../../../../infrastructure/socket/socket.service'
import type { CoinLogResponse }          from '@control-aula/shared'
import { AwardCoinsCommand }             from './award-coins.command'

@CommandHandler(AwardCoinsCommand)
export class AwardCoinsHandler implements ICommandHandler<AwardCoinsCommand, CoinLogResponse> {
  constructor(
    private readonly repo:          PointRepository,
    private readonly notifications: NotificationService,
    private readonly realtime:      SocketService,
  ) {}

  async execute({ dto }: AwardCoinsCommand): Promise<CoinLogResponse> {
    const log = await this.repo.awardCoins(dto)

    // Real-time: update coin displays instantly
    this.realtime.coinsUpdated({
      courseId:     dto.courseId,
      classCoins:   log.updatedClassCoins,
      studentId:    dto.studentId,
      studentCoins: log.updatedStudentCoins,
    })

    // Fire-and-forget: push + inbox notification
    if (dto.studentId) {
      this.notifications.notifyCoinsAwarded(dto.studentId, dto.coins, dto.reason).catch(() => {})
    }

    return CoinLogMapper.toResponse(log)
  }
}
