import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService }                 from '../../infrastructure/prisma/prisma.service'
import { CoinsClient }                   from '../../core-client/coins.client'

export interface LevelCompleteResult {
  coinsEarned:    number
  newBalance:     number
  alreadyApplied: boolean
}

export interface ContinueGameResult {
  coinsSpent: number
  newBalance: number
}

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coins:  CoinsClient,
  ) {}

  async completeLevel(
    studentId:      string,
    gameSlug:       string,
    levelNumber:    number,
    idempotencyKey: string,
  ): Promise<LevelCompleteResult> {
    const game = await this.prisma.game.findUnique({
      where:  { slug: gameSlug },
      select: { coinsPerLevelBase: true, coinsPerLevelStep: true },
    })

    if (!game) throw new NotFoundException(`Game '${gameSlug}' not found`)

    const coinsEarned = game.coinsPerLevelBase + (levelNumber - 1) * game.coinsPerLevelStep

    const result = await this.coins.grant({
      studentId,
      amount:        coinsEarned,
      reason:        `Level ${levelNumber} in ${gameSlug}`,
      sourceId:      idempotencyKey,
      sourceModule:  'games',
      idempotencyKey,
    })

    return {
      coinsEarned,
      newBalance:     result.newBalance,
      alreadyApplied: result.alreadyApplied,
    }
  }

  async useContinue(
    studentId:      string,
    gameSlug:       string,
    idempotencyKey: string,
  ): Promise<ContinueGameResult> {
    const game = await this.prisma.game.findUnique({
      where:  { slug: gameSlug },
      select: { continueCost: true },
    })

    if (!game) throw new NotFoundException(`Game '${gameSlug}' not found`)

    if (game.continueCost === 0) return { coinsSpent: 0, newBalance: 0 }

    const result = await this.coins.spend({
      studentId,
      amount:        game.continueCost,
      reason:        `Continue in ${gameSlug}`,
      sourceId:      idempotencyKey,
      idempotencyKey,
    })

    return { coinsSpent: game.continueCost, newBalance: result.newBalance }
  }
}
