import { Injectable }   from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { InboxRepository } from '../domain/inbox.repository'
import type { NotificationEntity, NotificationPayload } from '../domain/notification.entity'

@Injectable()
export class InboxRepositoryImpl extends InboxRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  async create(userId: string, payload: NotificationPayload): Promise<NotificationEntity> {
    return this.prisma.notification.create({
      data: {
        userId,
        title: payload.title,
        body:  payload.body,
        url:   payload.url ?? '/',
        tag:   payload.tag ?? '',
      },
    })
  }

  async findByUser(userId: string, limit = 50): Promise<NotificationEntity[]> {
    return this.prisma.notification.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      take:    limit,
    })
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } })
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({ where: { id, userId } })
  }

  async deleteMany(ids: string[], userId: string): Promise<void> {
    if (!ids.length) return
    await this.prisma.notification.deleteMany({ where: { id: { in: ids }, userId } })
  }

  async deleteAll(userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({ where: { userId } })
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } })
  }
}
