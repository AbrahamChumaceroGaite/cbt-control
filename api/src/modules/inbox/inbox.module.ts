import { Module }           from '@nestjs/common'
import { CqrsModule }        from '@nestjs/cqrs'
import { InboxController }   from './inbox.controller'
import { InboxRepository }   from './domain/inbox.repository'
import { InboxRepositoryImpl } from './infrastructure/inbox.repository.impl'
import { GetInboxHandler }   from './application/queries/get-inbox.query'
import { MarkReadHandler }   from './application/commands/mark-read.command'
import { BatchInboxHandler } from './application/commands/batch-inbox.command'
import { AuthModule }        from '../auth/auth.module'

@Module({
  imports:     [CqrsModule, AuthModule],
  controllers: [InboxController],
  providers:   [
    { provide: InboxRepository, useClass: InboxRepositoryImpl },
    GetInboxHandler,
    MarkReadHandler,
    BatchInboxHandler,
  ],
  exports: [InboxRepository],
})
export class InboxModule {}
