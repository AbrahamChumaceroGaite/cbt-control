import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

const DISCOUNT_POOL = [0, 0, 0, 10, 15, 20, 25, 30] // mostly no discount

@Injectable()
export class ResetService {
  private readonly logger = new Logger(ResetService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Every Monday at 00:00 Bolivia time (UTC-4 = 04:00 UTC).
   * Deletes all pending redemption requests so students can re-request rewards for the new week.
   */
  @Cron('0 4 * * 1', { name: 'weekly-rewards-reset' })
  async resetWeeklyRedemptionRequests() {
    const { count } = await this.prisma.redemptionRequest.deleteMany({
      where: { status: 'pending' },
    })
    this.logger.log(`Weekly reset: deleted ${count} pending redemption request(s)`)
  }

  /**
   * Every 2 days at 05:00 UTC.
   * Randomly assigns discounts (0, 10, 15, 20, 25 or 30%) to individual rewards.
   * Most rewards get 0% (no discount) to keep it special.
   */
  @Cron('0 5 */2 * *', { name: 'discount-rotation' })
  async rotateDiscounts() {
    const rewards = await this.prisma.reward.findMany({
      where:  { type: 'individual', isActive: true },
      select: { id: true },
    })
    if (!rewards.length) return

    const now = new Date()
    const endsAt = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48h from now

    const updates = rewards.map(r => {
      const disc = DISCOUNT_POOL[Math.floor(Math.random() * DISCOUNT_POOL.length)]
      return this.prisma.reward.update({
        where: { id: r.id },
        data:  { discount: disc, discountEndsAt: disc > 0 ? endsAt : null },
      })
    })

    await Promise.all(updates)

    const withDiscount = (await Promise.all(updates)).filter(r => r.discount > 0).length
    this.logger.log(`Discount rotation: ${withDiscount}/${rewards.length} rewards now on sale`)
  }
}
