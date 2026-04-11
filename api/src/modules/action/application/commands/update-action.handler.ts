import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { ActionResponse }  from '@control-aula/shared'
import { ActionRepository }     from '../../domain/action.repository'
import { ActionMapper }         from '../action.mapper'
import { UpdateActionCommand }  from './update-action.command'

@CommandHandler(UpdateActionCommand)
export class UpdateActionHandler implements ICommandHandler<UpdateActionCommand, ActionResponse> {
  constructor(private readonly repo: ActionRepository) {}

  async execute({ id, dto }: UpdateActionCommand): Promise<ActionResponse> {
    const action = await this.repo.update(id, dto)
    return ActionMapper.toResponse(action)
  }
}
