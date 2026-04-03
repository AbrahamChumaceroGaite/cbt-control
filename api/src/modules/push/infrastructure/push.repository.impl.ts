import { Injectable }   from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { PushRepository } from '../domain/push.repository'
import type { PushSubscriptionEntity } from '../domain/push-subscription.entity'

@Injectable()
export class PushRepositoryImpl extends PushRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  async upsert(userId: string, endpoint: string, p256dh: string, auth: string): Promise<void> {
    await this.prisma.pushSubscription.upsert({
      where:  { endpoint },
      update: { p256dh, auth, userId },
      create: { userId, endpoint, p256dh, auth },
    })
  }

  async removeByEndpoint(endpoint: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint } })
  }

  async findByUserId(userId: string): Promise<PushSubscriptionEntity[]> {
    return this.prisma.pushSubscription.findMany({ where: { userId } })
  }

  async findByRole(role: string): Promise<PushSubscriptionEntity[]> {
    const users = await this.prisma.user.findMany({
      where:   { role, isActive: true },
      include: { pushSubscriptions: true },
    })
    return users.flatMap(u => u.pushSubscriptions)
  }

  async removeExpired(endpoints: string[]): Promise<void> {
    if (!endpoints.length) return
    await this.prisma.pushSubscription.deleteMany({ where: { endpoint: { in: endpoints } } })
  }
}
