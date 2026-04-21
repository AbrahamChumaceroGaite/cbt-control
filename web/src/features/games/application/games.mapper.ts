import type { GameResponse, LevelResponse } from '@control-aula/shared'
import type { EditGameForm, GameViewModel, LevelTier, LevelViewModel } from '../domain/types'

export function getTier(level: number): LevelTier {
  if (level <= 5)  return 'Tutorial'
  if (level <= 10) return 'Normal'
  if (level <= 15) return 'Hard'
  if (level <= 20) return 'Elite'
  if (level <= 25) return 'Nightmare'
  return 'Inferno'
}

export const GamesMapper = {
  toViewModel(dto: GameResponse): GameViewModel {
    return {
      ...dto,
      coinsAtMaxLevel: dto.coinsPerLevelBase + (dto.maxLevels - 1) * dto.coinsPerLevelStep,
    }
  },

  toLevelViewModel(dto: LevelResponse): LevelViewModel {
    return { ...dto, tier: getTier(dto.number) }
  },

  toEditForm(game: GameViewModel): EditGameForm {
    return {
      title:             game.title,
      description:       game.description,
      iconEmoji:         game.iconEmoji,
      coverUrl:          game.coverUrl,
      isActive:          game.isActive,
      coinsPerLevelBase: game.coinsPerLevelBase,
      coinsPerLevelStep: game.coinsPerLevelStep,
      bonusCoins:        game.bonusCoins,
      continueCost:      game.continueCost,
      maxLevels:         game.maxLevels,
      emulatorCore:      game.emulatorCore  ?? '',
      gameFileUrl:       game.gameFileUrl   ?? '',
      biosFileUrl:       game.biosFileUrl   ?? '',
    }
  },
}
