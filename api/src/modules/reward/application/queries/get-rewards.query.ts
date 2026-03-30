import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { RewardRepository } from '../../domain/reward.repository'
import { RewardMapper }     from '../reward.mapper'
import type { RewardResponse } from '@control-aula/shared'

export class GetRewardsQuery {}

@QueryHandler(GetRewardsQuery)
export class GetRewardsHandler implements IQueryHandler<GetRewardsQuery, RewardResponse[]> {
  constructor(private readonly repo: RewardRepository) {}

  async execute(): Promise<RewardResponse[]> {
    const rewards = await this.repo.findAll()
    return rewards.map(RewardMapper.toResponse)
  }
}
