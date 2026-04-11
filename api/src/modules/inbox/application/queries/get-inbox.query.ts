import type { NotificationDto } from '../../domain/notification.entity'

export class GetInboxQuery {
  constructor(public readonly userId: string) {}
}

export interface InboxResult {
  items:       NotificationDto[]
  unreadCount: number
}
