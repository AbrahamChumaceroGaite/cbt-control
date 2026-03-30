import { ICommandHandler, CommandHandler }    from '@nestjs/cqrs'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { RewardRepository } from '../../domain/reward.repository'
import { RewardMapper }     from '../reward.mapper'
import type { RewardResponse } from '@control-aula/shared'

export class CreateRewardDto {
  @IsString()  @IsNotEmpty()  name!:           string
  @IsNumber()                 coinsRequired!:  number
  @IsOptional() @IsString()   description?:    string
  @IsOptional() @IsString()   icon?:           string
  @IsOptional() @IsString()   type?:           string
  @IsOptional() @IsBoolean()  isGlobal?:       boolean
}

export class CreateRewardCommand {
  constructor(public readonly dto: CreateRewardDto) {}
}

@CommandHandler(CreateRewardCommand)
export class CreateRewardHandler implements ICommandHandler<CreateRewardCommand, RewardResponse> {
  constructor(private readonly repo: RewardRepository) {}

  async execute({ dto }: CreateRewardCommand): Promise<RewardResponse> {
    const reward = await this.repo.create(dto)
    return RewardMapper.toResponse(reward)
  }
}
