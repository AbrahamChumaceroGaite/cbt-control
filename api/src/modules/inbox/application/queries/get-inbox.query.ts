import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InboxRepository } from '../../domain/inbox.repository'
import { toNotificationDto, type NotificationDto } from '../../domain/notification.entity'

export class GetInboxQuery {
  constructor(public readonly userId: string) {}
}

export interface InboxResult {
  items:       NotificationDto[]
  unreadCount: number
}

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
