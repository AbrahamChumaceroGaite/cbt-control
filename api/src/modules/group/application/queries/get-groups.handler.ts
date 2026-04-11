import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { GroupResponse } from '@control-aula/shared'
import { GroupRepository }    from '../../domain/group.repository'
import { GroupMapper }        from '../group.mapper'
import { GetGroupsQuery }     from './get-groups.query'

@QueryHandler(GetGroupsQuery)
export class GetGroupsHandler implements IQueryHandler<GetGroupsQuery, GroupResponse[]> {
  constructor(private readonly repo: GroupRepository) {}

  async execute({ courseId }: GetGroupsQuery): Promise<GroupResponse[]> {
    const groups = await this.repo.findAll(courseId)
    return groups.map(GroupMapper.toResponse)
  }
}
