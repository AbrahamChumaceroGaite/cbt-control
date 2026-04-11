import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { RewardResponse } from '@control-aula/shared'
import { RewardRepository }    from '../../domain/reward.repository'
import { RewardMapper }        from '../reward.mapper'
import { GetRewardsQuery }     from './get-rewards.query'

@QueryHandler(GetRewardsQuery)
export class GetRewardsHandler implements IQueryHandler<GetRewardsQuery, RewardResponse[]> {
  constructor(private readonly repo: RewardRepository) {}

  async execute(): Promise<RewardResponse[]> {
    const rewards = await this.repo.findAll()
    return rewards.map(RewardMapper.toResponse)
  }
}
