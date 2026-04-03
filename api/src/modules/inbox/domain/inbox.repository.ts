import type { NotificationEntity, NotificationPayload } from './notification.entity'

export abstract class InboxRepository {
  abstract create(userId: string, payload: NotificationPayload): Promise<NotificationEntity>
  abstract findByUser(userId: string, limit?: number): Promise<NotificationEntity[]>
  abstract markRead(id: string, userId: string): Promise<void>
  abstract markAllRead(userId: string): Promise<void>
  abstract delete(id: string, userId: string): Promise<void>
  abstract deleteMany(ids: string[], userId: string): Promise<void>
  abstract deleteAll(userId: string): Promise<void>
  abstract countUnread(userId: string): Promise<number>
}
