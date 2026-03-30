import { ICommandHandler, CommandHandler }    from '@nestjs/cqrs'
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'
import { RewardRepository } from '../../domain/reward.repository'
import { RewardMapper }     from '../reward.mapper'
import type { RewardResponse } from '@control-aula/shared'

export class UpdateRewardDto {
  @IsOptional() @IsString()  name?:          string
  @IsOptional() @IsString()  description?:   string
  @IsOptional() @IsString()  icon?:          string
  @IsOptional() @IsNumber()  coinsRequired?: number
  @IsOptional() @IsString()  type?:          string
  @IsOptional() @IsBoolean() isGlobal?:      boolean
  @IsOptional() @IsBoolean() isActive?:      boolean
}

export class UpdateRewardCommand {
  constructor(public readonly id: string, public readonly dto: UpdateRewardDto) {}
}

@CommandHandler(UpdateRewardCommand)
export class UpdateRewardHandler implements ICommandHandler<UpdateRewardCommand, RewardResponse> {
  constructor(private readonly repo: RewardRepository) {}

  async execute({ id, dto }: UpdateRewardCommand): Promise<RewardResponse> {
    const reward = await this.repo.update(id, dto)
    return RewardMapper.toResponse(reward)
  }
}
