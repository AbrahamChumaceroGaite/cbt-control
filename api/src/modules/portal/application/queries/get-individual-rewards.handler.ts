import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PortalRepository }            from '../../domain/portal.repository'
import { GetIndividualRewardsQuery }   from './get-individual-rewards.query'

@QueryHandler(GetIndividualRewardsQuery)
export class GetIndividualRewardsHandler implements IQueryHandler<GetIndividualRewardsQuery> {
  constructor(private readonly repo: PortalRepository) {}

  execute({ studentId }: GetIndividualRewardsQuery) {
    return this.repo.getIndividualRewards(studentId)
  }
}
