import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InboxRepository }                from '../../domain/inbox.repository'
import { BatchInboxCommand }              from './batch-inbox.command'

@CommandHandler(BatchInboxCommand)
export class BatchInboxHandler implements ICommandHandler<BatchInboxCommand, void> {
  constructor(private readonly repo: InboxRepository) {}

  async execute({ userId, dto }: BatchInboxCommand): Promise<void> {
    switch (dto.action) {
      case 'mark-all-read': return this.repo.markAllRead(userId)
      case 'delete-all':    return this.repo.deleteAll(userId)
      case 'delete-many':   return this.repo.deleteMany(dto.ids ?? [], userId)
    }
  }
}
