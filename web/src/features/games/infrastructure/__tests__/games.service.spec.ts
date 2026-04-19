import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameResponse, LevelResponse } from '@control-aula/shared'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    GAMES: {
      BASE:    '/api-games/games',
      BY_SLUG: (slug: string)   => `/api-games/games/${slug}`,
      LEVELS:  (gameId: string) => `/api-games/games/${gameId}/levels`,
    },
  },
}))

import { api }          from '@/lib/api'
import { gamesService } from '../games.service'

const mockApi = vi.mocked(api)

const fakeGame: GameResponse = {
  id: 'g1', slug: 'tank-invaders', title: 'Tank Invaders',
  description: 'desc', coverUrl: '', iconEmoji: '🎮', isActive: true,
  maxLevels: 30, coinsPerLevelBase: 5, coinsPerLevelStep: 2,
  bonusCoins: 4, continueCost: 2, createdAt: '2026-01-01',
}

const fakeLevel: LevelResponse = {
  id: 'l1', gameId: 'g1', number: 1,
  config: {
    formation: 'standard', speedMult: 0.8, fireRateMult: 0.8,
    enemyMix: { light: 1, medium: 0, heavy: 0 }, bunkerCount: 2,
    hasMysteryTank: false, specialEvent: 'none', isBoss: false,
    bossHits: 0, enemyCols: 8, enemyRows: 4,
  },
}

beforeEach(() => vi.clearAllMocks())

describe('gamesService', () => {
  describe('getAll()', () => {
    it('calls /api-games/games and returns data', async () => {
      mockApi.mockResolvedValueOnce({ data: [fakeGame], message: 'OK' })
      const result = await gamesService.getAll()
      expect(mockApi).toHaveBeenCalledWith('/api-games/games')
      expect(result).toEqual([fakeGame])
    })
  })

  describe('getBySlug()', () => {
    it('calls /api-games/games/:slug and returns data', async () => {
      mockApi.mockResolvedValueOnce({ data: fakeGame, message: 'OK' })
      const result = await gamesService.getBySlug('tank-invaders')
      expect(mockApi).toHaveBeenCalledWith('/api-games/games/tank-invaders')
      expect(result).toEqual(fakeGame)
    })
  })

  describe('getLevels()', () => {
    it('calls /api-games/games/:gameId/levels and returns data', async () => {
      mockApi.mockResolvedValueOnce({ data: [fakeLevel], message: 'OK' })
      const result = await gamesService.getLevels('g1')
      expect(mockApi).toHaveBeenCalledWith('/api-games/games/g1/levels')
      expect(result).toEqual([fakeLevel])
    })
  })
})
