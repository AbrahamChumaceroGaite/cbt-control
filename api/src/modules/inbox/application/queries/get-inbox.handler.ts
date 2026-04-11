import { IQueryHandler, QueryHandler }    from '@nestjs/cqrs'
import { InboxRepository }               from '../../domain/inbox.repository'
import { toNotificationDto }             from '../../domain/notification.entity'
import { GetInboxQuery, InboxResult }    from './get-inbox.query'

@QueryHandler(GetInboxQuery)
export class GetInboxHandler implements IQueryHandler<GetInboxQuery, InboxResult> {
  constructor(private readonly repo: InboxRepository) {}

  async execute({ userId }: GetInboxQuery): Promise<InboxResult> {
    const [items, unreadCount] = await Promise.all([
      this.repo.findByUser(userId, 50),
      this.repo.countUnread(userId),
    ])
    return { items: items.map(toNotificationDto), unreadCount }
  }
}
