import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InboxRepository }                from '../../domain/inbox.repository'
import { MarkReadCommand }                from './mark-read.command'

@CommandHandler(MarkReadCommand)
export class MarkReadHandler implements ICommandHandler<MarkReadCommand, void> {
  constructor(private readonly repo: InboxRepository) {}

  execute({ id, userId }: MarkReadCommand): Promise<void> {
    return this.repo.markRead(id, userId)
  }
}
