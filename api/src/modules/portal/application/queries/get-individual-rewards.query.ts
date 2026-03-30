import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PortalRepository }            from '../../domain/portal.repository'

export class GetIndividualRewardsQuery {
  constructor(public readonly studentId: string) {}
}

@QueryHandler(GetIndividualRewardsQuery)
export class GetIndividualRewardsHandler implements IQueryHandler<GetIndividualRewardsQuery> {
  constructor(private readonly repo: PortalRepository) {}

  execute({ studentId }: GetIndividualRewardsQuery) {
    return this.repo.getIndividualRewards(studentId)
  }
}
