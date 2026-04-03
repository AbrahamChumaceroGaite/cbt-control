import { Module }              from '@nestjs/common'
import { CqrsModule }           from '@nestjs/cqrs'
import { PushController }       from './push.controller'
import { PushRepository }       from './domain/push.repository'
import { PushRepositoryImpl }   from './infrastructure/push.repository.impl'
import { PushSenderService }    from './infrastructure/push-sender.service'
import { NotificationService }  from './application/notification.service'
import { SubscribeHandler }     from './application/commands/subscribe.command'
import { UnsubscribeHandler }   from './application/commands/unsubscribe.command'
import { AuthModule }           from '../auth/auth.module'
import { InboxModule }          from '../inbox/inbox.module'

@Module({
  imports:     [CqrsModule, AuthModule, InboxModule],
  controllers: [PushController],
  providers:   [
    { provide: PushRepository, useClass: PushRepositoryImpl },
    PushSenderService,
    NotificationService,
    SubscribeHandler,
    UnsubscribeHandler,
  ],
  exports: [NotificationService],
})
export class PushModule {}
