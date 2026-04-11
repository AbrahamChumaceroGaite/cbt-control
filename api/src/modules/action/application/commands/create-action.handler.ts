import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { ActionResponse }  from '@control-aula/shared'
import { ActionRepository }     from '../../domain/action.repository'
import { ActionMapper }         from '../action.mapper'
import { CreateActionCommand }  from './create-action.command'

@CommandHandler(CreateActionCommand)
export class CreateActionHandler implements ICommandHandler<CreateActionCommand, ActionResponse> {
  constructor(private readonly repo: ActionRepository) {}

  async execute({ dto }: CreateActionCommand): Promise<ActionResponse> {
    const action = await this.repo.create(dto)
    return ActionMapper.toResponse(action)
  }
}
