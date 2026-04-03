import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { InboxRepository } from '../../domain/inbox.repository'

export class MarkReadCommand {
  constructor(public readonly id: string, public readonly userId: string) {}
}

@CommandHandler(MarkReadCommand)
export class MarkReadHandler implements ICommandHandler<MarkReadCommand, void> {
  constructor(private readonly repo: InboxRepository) {}

  execute({ id, userId }: MarkReadCommand): Promise<void> {
    return this.repo.markRead(id, userId)
  }
}
