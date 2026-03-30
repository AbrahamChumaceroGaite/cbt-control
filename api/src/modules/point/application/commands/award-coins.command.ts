import { ICommandHandler, CommandHandler }    from '@nestjs/cqrs'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { PointRepository } from '../../domain/point.repository'
import { CoinLogMapper }   from '../coin-log.mapper'
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
  constructor(private readonly repo: PointRepository) {}

  async execute({ dto }: AwardCoinsCommand): Promise<CoinLogResponse> {
    const log = await this.repo.awardCoins(dto)
    return CoinLogMapper.toResponse(log)
  }
}
