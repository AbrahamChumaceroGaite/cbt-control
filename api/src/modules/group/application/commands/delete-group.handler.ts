import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { GroupRepository }    from '../../domain/group.repository'
import { DeleteGroupCommand } from './delete-group.command'

@CommandHandler(DeleteGroupCommand)
export class DeleteGroupHandler implements ICommandHandler<DeleteGroupCommand, void> {
  constructor(private readonly repo: GroupRepository) {}

  async execute({ id }: DeleteGroupCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
