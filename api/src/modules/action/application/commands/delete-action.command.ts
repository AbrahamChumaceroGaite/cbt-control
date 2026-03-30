import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { ActionRepository } from '../../domain/action.repository'

export class DeleteActionCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteActionCommand)
export class DeleteActionHandler implements ICommandHandler<DeleteActionCommand, void> {
  constructor(private readonly repo: ActionRepository) {}

  async execute({ id }: DeleteActionCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
