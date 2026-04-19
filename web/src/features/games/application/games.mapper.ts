import type { GameResponse, LevelResponse } from '@control-aula/shared'
import type { GameViewModel, LevelTier, LevelViewModel } from '../domain/types'

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
}
