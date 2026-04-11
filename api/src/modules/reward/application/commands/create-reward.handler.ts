import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { RewardResponse }  from '@control-aula/shared'
import { RewardRepository }     from '../../domain/reward.repository'
import { RewardMapper }         from '../reward.mapper'
import { CreateRewardCommand }  from './create-reward.command'

@CommandHandler(CreateRewardCommand)
export class CreateRewardHandler implements ICommandHandler<CreateRewardCommand, RewardResponse> {
  constructor(private readonly repo: RewardRepository) {}

  async execute({ dto }: CreateRewardCommand): Promise<RewardResponse> {
    const reward = await this.repo.create(dto)
    return RewardMapper.toResponse(reward)
  }
}
