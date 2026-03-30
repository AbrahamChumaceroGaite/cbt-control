import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { ActionRepository } from '../../domain/action.repository'
import { ActionMapper }     from '../action.mapper'
import type { ActionResponse } from '@control-aula/shared'

export class GetActionsQuery {}

@QueryHandler(GetActionsQuery)
export class GetActionsHandler implements IQueryHandler<GetActionsQuery, ActionResponse[]> {
  constructor(private readonly repo: ActionRepository) {}

  async execute(): Promise<ActionResponse[]> {
    const actions = await this.repo.findAll()
    return actions.map(ActionMapper.toResponse)
  }
}
