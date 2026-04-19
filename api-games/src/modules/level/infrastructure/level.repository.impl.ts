import { Injectable }     from '@nestjs/common'
import { PrismaService }  from '../../../infrastructure/prisma/prisma.service'
import type { LevelRepository } from '../domain/level.repository'
import { LevelEntity }    from '../domain/level.entity'

const SELECT = {
  id:             true,
  gameId:         true,
  number:         true,
  speedMult:      true,
  fireRateMult:   true,
  enemyColsCount: true,
  enemyRowsCount: true,
  bunkerCount:    true,
  hasMysteryTank: true,
  specialEvent:   true,
  isBoss:         true,
  bossHits:       true,
  enemyMixLight:  true,
  enemyMixMedium: true,
  enemyMixHeavy:  true,
} as const

@Injectable()
export class LevelRepositoryImpl implements LevelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByGame(gameId: string): Promise<LevelEntity[]> {
    const records = await this.prisma.level.findMany({
      where:   { gameId },
      select:  SELECT,
      orderBy: { number: 'asc' },
    })
    return records.map(r => LevelEntity.fromRecord(r))
  }

  async findByNumber(gameId: string, number: number): Promise<LevelEntity | null> {
    const r = await this.prisma.level.findUnique({
      where:  { gameId_number: { gameId, number } },
      select: SELECT,
    })
    return r ? LevelEntity.fromRecord(r) : null
  }
}
