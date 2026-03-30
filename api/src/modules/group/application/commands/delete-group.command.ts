import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { GroupRepository } from '../../domain/group.repository'

export class DeleteGroupCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteGroupCommand)
export class DeleteGroupHandler implements ICommandHandler<DeleteGroupCommand, void> {
  constructor(private readonly repo: GroupRepository) {}

  async execute({ id }: DeleteGroupCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
