import { BadRequestException } from '@nestjs/common'

export class GameEntity {
  private constructor(
    readonly id:                string,
    readonly slug:              string,
    readonly title:             string,
    readonly description:       string,
    readonly coverUrl:          string,
    readonly iconEmoji:         string,
    readonly isActive:          boolean,
    readonly maxLevels:         number,
    readonly coinsPerLevelBase: number,
    readonly coinsPerLevelStep: number,
    readonly bonusCoins:        number,
    readonly continueCost:      number,
    readonly createdAt:         Date,
    readonly emulatorCore:      string | null,
    readonly gameFileUrl:       string | null,
    readonly biosFileUrl:       string | null,
  ) {}

  static create(dto: {
    id?:                string
    slug:               string
    title:              string
    description?:       string
    coverUrl?:          string
    iconEmoji?:         string
    isActive?:          boolean
    maxLevels?:         number
    coinsPerLevelBase?: number
    coinsPerLevelStep?: number
    bonusCoins?:        number
    continueCost?:      number
    createdAt?:         Date
    emulatorCore?:      string | null
    gameFileUrl?:       string | null
    biosFileUrl?:       string | null
  }): GameEntity {
    if (!dto.title || dto.title.trim().length < 2)
      throw new BadRequestException('Game title must be at least 2 characters')

    if (!dto.slug || dto.slug.trim().length < 2)
      throw new BadRequestException('Game slug must be at least 2 characters')

    if (!/^[a-z0-9-]+$/.test(dto.slug.trim()))
      throw new BadRequestException('Game slug must be lowercase letters, numbers, and hyphens only')

    // maxLevels=0 is valid for emulator/free-roam games with no level system
    const maxLevels = dto.maxLevels ?? 30
    if (maxLevels < 0 || maxLevels > 100)
      throw new BadRequestException('Game maxLevels must be between 0 and 100')

    const base = dto.coinsPerLevelBase ?? 5
    if (base < 1)
      throw new BadRequestException('Coins per level base must be at least 1')

    const cost = dto.continueCost ?? 2
    if (cost < 0)
      throw new BadRequestException('Continue cost cannot be negative')

    return new GameEntity(
      dto.id ?? crypto.randomUUID(),
      dto.slug.trim(),
      dto.title.trim(),
      dto.description ?? '',
      dto.coverUrl ?? '',
      dto.iconEmoji ?? '🎮',
      dto.isActive ?? false,
      maxLevels,
      base,
      dto.coinsPerLevelStep ?? 2,
      dto.bonusCoins ?? 4,
      cost,
      dto.createdAt ?? new Date(),
      dto.emulatorCore ?? null,
      dto.gameFileUrl ?? null,
      dto.biosFileUrl ?? null,
    )
  }

  /** Coins awarded for completing the given level number (1-based). */
  coinsForLevel(level: number): number {
    return this.coinsPerLevelBase + (level - 1) * this.coinsPerLevelStep
  }
}
