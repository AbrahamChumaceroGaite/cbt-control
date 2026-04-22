import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameResponse, LevelResponse } from '@control-aula/shared'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    GAMES: {
      BASE:           '/api-games/games',
      BY_SLUG:        (slug: string)   => `/api-games/games/${slug}`,
      LEVELS:         (gameId: string) => `/api-games/games/${gameId}/levels`,
      UPDATE:         (id: string)     => `/api-games/games/${id}`,
      UPLOAD_URL:     (id: string) => `/api-games/games/${id}/upload-url`,
      LEVEL_COMPLETE: '/api-games/sessions/level-complete',
      CONTINUE:       '/api-games/sessions/continue',
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
  emulatorCore: null, gameFileUrl: null, biosFileUrl: null,
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

  describe('update()', () => {
    it('calls PATCH /api-games/games/:id with dto and returns data', async () => {
      mockApi.mockResolvedValueOnce({ data: fakeGame, message: 'OK' })
      const dto = { title: 'New Title', isActive: false }
      const result = await gamesService.update('g1', dto)
      expect(mockApi).toHaveBeenCalledWith(
        '/api-games/games/g1',
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify(dto) }),
      )
      expect(result).toEqual(fakeGame)
    })
  })

  describe('completeLevel()', () => {
    it('calls POST /api-games/sessions/level-complete and returns data', async () => {
      const payload = { coinsEarned: 7, newBalance: 42, alreadyApplied: false }
      mockApi.mockResolvedValueOnce({ data: payload, message: 'OK' })
      const result = await gamesService.completeLevel('tank-invaders', 3, 500, 'key-1')
      expect(mockApi).toHaveBeenCalledWith(
        '/api-games/sessions/level-complete',
        expect.objectContaining({
          method: 'POST',
          body:   JSON.stringify({ gameSlug: 'tank-invaders', levelNumber: 3, score: 500, idempotencyKey: 'key-1' }),
        }),
      )
      expect(result).toEqual(payload)
    })
  })

  describe('useContinue()', () => {
    it('calls POST /api-games/sessions/continue and returns data', async () => {
      const payload = { coinsSpent: 2, newBalance: 40 }
      mockApi.mockResolvedValueOnce({ data: payload, message: 'OK' })
      const result = await gamesService.useContinue('tank-invaders', 'key-2')
      expect(mockApi).toHaveBeenCalledWith(
        '/api-games/sessions/continue',
        expect.objectContaining({
          method: 'POST',
          body:   JSON.stringify({ gameSlug: 'tank-invaders', idempotencyKey: 'key-2' }),
        }),
      )
      expect(result).toEqual(payload)
    })
  })
})
