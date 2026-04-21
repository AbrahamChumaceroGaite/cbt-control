import { Injectable }      from '@nestjs/common'
import { PrismaService }   from '../../../infrastructure/prisma/prisma.service'
import type { GameRepository } from '../domain/game.repository'
import { GameEntity }      from '../domain/game.entity'

const SELECT = {
  id:                true,
  slug:              true,
  title:             true,
  description:       true,
  coverUrl:          true,
  iconEmoji:         true,
  isActive:          true,
  maxLevels:         true,
  coinsPerLevelBase: true,
  coinsPerLevelStep: true,
  bonusCoins:        true,
  continueCost:      true,
  createdAt:         true,
  emulatorCore:      true,
  gameFileUrl:       true,
  biosFileUrl:       true,
} as const

type GameRecord = {
  id: string; slug: string; title: string; description: string
  coverUrl: string; iconEmoji: string; isActive: boolean; maxLevels: number
  coinsPerLevelBase: number; coinsPerLevelStep: number; bonusCoins: number
  continueCost: number; createdAt: Date
  emulatorCore: string | null; gameFileUrl: string | null; biosFileUrl: string | null
}

function toEntity(r: GameRecord): GameEntity {
  return GameEntity.create(r)
}

@Injectable()
export class GameRepositoryImpl implements GameRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<GameEntity[]> {
    const records = await this.prisma.game.findMany({
      select:  SELECT,
      orderBy: { createdAt: 'asc' },
    })
    return records.map(toEntity)
  }

  async findById(id: string): Promise<GameEntity | null> {
    const r = await this.prisma.game.findUnique({ where: { id }, select: SELECT })
    return r ? toEntity(r) : null
  }

  async findBySlug(slug: string): Promise<GameEntity | null> {
    const r = await this.prisma.game.findUnique({ where: { slug }, select: SELECT })
    return r ? toEntity(r) : null
  }

  async create(entity: GameEntity): Promise<GameEntity> {
    const r = await this.prisma.game.create({
      data: {
        id:                entity.id,
        slug:              entity.slug,
        title:             entity.title,
        description:       entity.description,
        coverUrl:          entity.coverUrl,
        iconEmoji:         entity.iconEmoji,
        isActive:          entity.isActive,
        maxLevels:         entity.maxLevels,
        coinsPerLevelBase: entity.coinsPerLevelBase,
        coinsPerLevelStep: entity.coinsPerLevelStep,
        bonusCoins:        entity.bonusCoins,
        continueCost:      entity.continueCost,
        emulatorCore:      entity.emulatorCore,
        gameFileUrl:       entity.gameFileUrl,
        biosFileUrl:       entity.biosFileUrl,
      },
      select: SELECT,
    })
    return toEntity(r)
  }

  async update(entity: GameEntity): Promise<GameEntity> {
    const r = await this.prisma.game.update({
      where: { id: entity.id },
      data: {
        slug:              entity.slug,
        title:             entity.title,
        description:       entity.description,
        coverUrl:          entity.coverUrl,
        iconEmoji:         entity.iconEmoji,
        isActive:          entity.isActive,
        maxLevels:         entity.maxLevels,
        coinsPerLevelBase: entity.coinsPerLevelBase,
        coinsPerLevelStep: entity.coinsPerLevelStep,
        bonusCoins:        entity.bonusCoins,
        continueCost:      entity.continueCost,
        emulatorCore:      entity.emulatorCore,
        gameFileUrl:       entity.gameFileUrl,
        biosFileUrl:       entity.biosFileUrl,
      },
      select: SELECT,
    })
    return toEntity(r)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.game.delete({ where: { id } })
  }
}
