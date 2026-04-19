import type { GameResponse, LevelResponse } from '@control-aula/shared'

// ─── Tier ─────────────────────────────────────────────────────────────────────
export type LevelTier = 'Tutorial' | 'Normal' | 'Hard' | 'Elite' | 'Nightmare' | 'Inferno'

export const TIER_RANGES: Record<LevelTier, { from: number; to: number; color: string }> = {
  Tutorial:  { from: 1,  to: 5,  color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  Normal:    { from: 6,  to: 10, color: 'text-sky-400 bg-sky-400/10 border-sky-400/20'             },
  Hard:      { from: 11, to: 15, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20'       },
  Elite:     { from: 16, to: 20, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20'    },
  Nightmare: { from: 21, to: 25, color: 'text-red-400 bg-red-400/10 border-red-400/20'             },
  Inferno:   { from: 26, to: 30, color: 'text-rose-300 bg-rose-300/10 border-rose-300/20'          },
}

// ─── View models ──────────────────────────────────────────────────────────────
export type GameViewModel = GameResponse & {
  /** coins earned at maxLevels: base + (maxLevels - 1) * step */
  coinsAtMaxLevel: number
}

export type LevelViewModel = LevelResponse & {
  tier: LevelTier
}

// ─── Edit form ────────────────────────────────────────────────────────────────
export type EditGameForm = {
  title:             string
  description:       string
  iconEmoji:         string
  coverUrl:          string
  isActive:          boolean
  coinsPerLevelBase: number
  coinsPerLevelStep: number
  bonusCoins:        number
  continueCost:      number
  maxLevels:         number
}
