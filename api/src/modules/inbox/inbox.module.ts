import { Module }             from '@nestjs/common'
import { CqrsModule }          from '@nestjs/cqrs'
import { InboxController }     from './presentation/inbox.controller'
import { InboxRepository }     from './domain/inbox.repository'
import { InboxRepositoryImpl } from './infrastructure/inbox.repository.impl'
import { GetInboxHandler }     from './application/queries/get-inbox.handler'
import { MarkReadHandler }     from './application/commands/mark-read.handler'
import { BatchInboxHandler }   from './application/commands/batch-inbox.handler'
import { AuthModule }          from '../auth/auth.module'

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
