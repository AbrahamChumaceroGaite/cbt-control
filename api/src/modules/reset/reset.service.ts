import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import * as fs   from 'node:fs/promises'
import * as path from 'node:path'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { BackupService } from '../backup/application/backup.service'

const DISCOUNT_POOL = [0, 0, 0, 10, 15, 20, 25, 30] // mostly no discount

@Injectable()
export class ResetService {
  private readonly logger = new Logger(ResetService.name)

  constructor(
    private readonly prisma:  PrismaService,
    private readonly backup:  BackupService,
  ) {}

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

  /**
   * Daily at 07:00 UTC (03:00 Bolivia time).
   * Exports all data to /app/backups/backup-YYYY-MM-DD.json.
   * Retains files for the last 30 days; older files are deleted.
   */
  @Cron('0 7 * * *', { name: 'daily-backup' })
  async dailyBackup() {
    const BACKUP_DIR    = path.resolve('/app/backups')
    const RETENTION_DAYS = 30

    try {
      await fs.mkdir(BACKUP_DIR, { recursive: true })

      const date     = new Date().toISOString().slice(0, 10)
      const filename = `backup-${date}.json`
      const filepath = path.join(BACKUP_DIR, filename)

      const data = await this.backup.export([...this.backup.allSections])
      await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8')
      this.logger.log(`Daily backup written: ${filename}`)

      // Prune files older than RETENTION_DAYS
      const files  = await fs.readdir(BACKUP_DIR)
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - RETENTION_DAYS)

      for (const file of files) {
        const match = file.match(/^backup-(\d{4}-\d{2}-\d{2})\.json$/)
        if (!match) continue
        const fileDate = new Date(match[1])
        if (fileDate < cutoff) {
          await fs.unlink(path.join(BACKUP_DIR, file))
          this.logger.log(`Pruned old backup: ${file}`)
        }
      }
    } catch (err: unknown) {
      this.logger.error(`Daily backup failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}
