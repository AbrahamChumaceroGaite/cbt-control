import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { RewardResponse }  from '@control-aula/shared'
import { RewardRepository }     from '../../domain/reward.repository'
import { RewardMapper }         from '../reward.mapper'
import { UpdateRewardCommand }  from './update-reward.command'

@CommandHandler(UpdateRewardCommand)
export class UpdateRewardHandler implements ICommandHandler<UpdateRewardCommand, RewardResponse> {
  constructor(private readonly repo: RewardRepository) {}

  async execute({ id, dto }: UpdateRewardCommand): Promise<RewardResponse> {
    const reward = await this.repo.update(id, dto)
    return RewardMapper.toResponse(reward)
  }
}
