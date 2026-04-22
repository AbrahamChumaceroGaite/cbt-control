import type { GameEntity }   from '../domain/game.entity'
import type { GameResponse } from '@control-aula/shared'

export class GameMapper {
  static toResponse(entity: GameEntity): GameResponse {
    return {
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
      createdAt:         entity.createdAt.toISOString(),
      emulatorCore:      entity.emulatorCore,
      gameFileUrl:       entity.gameFileUrl,
      biosFileUrl:       entity.biosFileUrl,
    }
  }
}
