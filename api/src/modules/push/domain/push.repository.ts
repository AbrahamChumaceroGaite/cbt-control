import type { PushSubscriptionEntity } from './push-subscription.entity'

export abstract class PushRepository {
  abstract upsert(userId: string, endpoint: string, p256dh: string, auth: string): Promise<void>
  abstract removeByEndpoint(endpoint: string): Promise<void>
  abstract findByUserId(userId: string): Promise<PushSubscriptionEntity[]>
  /** Return all push subscriptions belonging to active users with the given role. */
  abstract findByRole(role: string): Promise<PushSubscriptionEntity[]>
  abstract removeExpired(endpoints: string[]): Promise<void>
}
