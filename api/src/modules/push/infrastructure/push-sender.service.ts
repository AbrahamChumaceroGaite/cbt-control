import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as webpush      from 'web-push'
import type { SubRow, PushPayload } from '../domain/push-subscription.entity'

/**
 * Infrastructure-layer service: its ONLY responsibility is calling webpush.sendNotification.
 * It knows nothing about users, roles, or business logic.
 * Returns the list of endpoints that are expired (HTTP 410) so callers can clean them up.
 */
@Injectable()
export class PushSenderService implements OnModuleInit {
  private readonly logger = new Logger(PushSenderService.name)
  private readonly _enabled: boolean
  readonly publicKey: string

  constructor(private readonly config: ConfigService) {
    this.publicKey       = this.config.get<string>('VAPID_PUBLIC_KEY')  ?? ''
    const privateKey     = this.config.get<string>('VAPID_PRIVATE_KEY') ?? ''
    const email          = this.config.get<string>('VAPID_EMAIL')       ?? 'mailto:admin@cbt.edu'
    this._enabled        = !!(this.publicKey && privateKey)

    if (this._enabled) {
      webpush.setVapidDetails(
        email.startsWith('mailto:') ? email : `mailto:${email}`,
        this.publicKey,
        privateKey,
      )
    }
  }

  onModuleInit() {
    if (!this._enabled) {
      this.logger.warn('Push disabled — set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY')
    }
  }

  get enabled(): boolean { return this._enabled }

  /**
   * Send a push payload to multiple subscriptions concurrently.
   * @returns Endpoints that returned HTTP 410 (expired/unsubscribed) — these should be deleted.
   */
  async sendMany(subs: SubRow[], payload: PushPayload): Promise<string[]> {
    const message  = JSON.stringify(payload)
    const expired: string[] = []

    await Promise.allSettled(
      subs.map(async sub => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            message,
          )
        } catch (err: any) {
          if (err?.statusCode === 410) {
            expired.push(sub.endpoint)
          } else {
            this.logger.warn(`Push failed [${err?.statusCode}] for ${sub.endpoint.slice(-20)}: ${err?.message}`)
          }
        }
      }),
    )

    return expired
  }
}
