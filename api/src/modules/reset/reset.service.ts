import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

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
}
