import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ActionRepository }   from '../../domain/action.repository'
import { DeleteActionCommand } from './delete-action.command'

@CommandHandler(DeleteActionCommand)
export class DeleteActionHandler implements ICommandHandler<DeleteActionCommand, void> {
  constructor(private readonly repo: ActionRepository) {}

  async execute({ id }: DeleteActionCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
