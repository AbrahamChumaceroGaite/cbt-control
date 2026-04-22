import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor }              from '@testing-library/react'
import type { GameResponse }                     from '@control-aula/shared'

vi.mock('../../infrastructure/games.service', () => ({
  gamesService: {
    completeLevel: vi.fn(),
    useContinue:   vi.fn(),
  },
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

import { useGameSession }  from '../useGameSession'
import { gamesService }    from '../../infrastructure/games.service'
import { GamesMapper }     from '../games.mapper'

const mockService   = vi.mocked(gamesService)
const mockShowToast = vi.fn()

const fakeGameResponse: GameResponse = {
  id: 'g1', slug: 'tank-invaders', title: 'Tank Invaders',
  description: 'desc', coverUrl: '', iconEmoji: '🎮', isActive: true,
  maxLevels: 30, coinsPerLevelBase: 5, coinsPerLevelStep: 2,
  bonusCoins: 4, continueCost: 2, createdAt: '2026-01-01',
  emulatorCore: null, gameFileUrl: null, biosFileUrl: null,
}
const fakeGame = GamesMapper.toViewModel(fakeGameResponse)

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  mockService.completeLevel.mockResolvedValue({ coinsEarned: 7, newBalance: 42, alreadyApplied: false })
  mockService.useContinue.mockResolvedValue({ coinsSpent: 2, newBalance: 40 })
})

describe('useGameSession', () => {
  describe('onLevelComplete()', () => {
    it('calls completeLevel and sets coinsEarned', async () => {
      const { result } = renderHook(() => useGameSession(fakeGame, 'u1'))
      await act(async () => { await result.current.onLevelComplete(3, 500) })
      expect(mockService.completeLevel).toHaveBeenCalledWith(
        'tank-invaders', 3, 500, expect.any(String),
      )
      expect(result.current.coinsEarned).toEqual({ amount: 7, newBalance: 42, level: 3 })
    })

    it('does nothing when game is null', async () => {
      const { result } = renderHook(() => useGameSession(null, 'u1'))
      await act(async () => { await result.current.onLevelComplete(1, 0) })
      expect(mockService.completeLevel).not.toHaveBeenCalled()
    })
  })

  describe('dismissCoins()', () => {
    it('clears coinsEarned', async () => {
      const { result } = renderHook(() => useGameSession(fakeGame, 'u1'))
      await act(async () => { await result.current.onLevelComplete(1, 0) })
      act(() => result.current.dismissCoins())
      expect(result.current.coinsEarned).toBeNull()
    })
  })

  describe('onGameOver()', () => {
    it('sets showContinue and continueLevel', () => {
      const { result } = renderHook(() => useGameSession(fakeGame, 'u1'))
      act(() => result.current.onGameOver(5))
      expect(result.current.showContinue).toBe(true)
      expect(result.current.continueLevel).toBe(5)
    })
  })

  describe('onContinue()', () => {
    it('calls useContinue, clears showContinue, and returns true', async () => {
      const { result } = renderHook(() => useGameSession(fakeGame, 'u1'))
      act(() => result.current.onGameOver(3))

      let ok: boolean | undefined
      await act(async () => { ok = await result.current.onContinue() })

      expect(mockService.useContinue).toHaveBeenCalledWith('tank-invaders', expect.any(String))
      expect(ok).toBe(true)
      expect(result.current.showContinue).toBe(false)
    })

    it('shows error toast and returns false when useContinue fails', async () => {
      mockService.useContinue.mockRejectedValueOnce(new Error('Insufficient coins'))
      const { result } = renderHook(() => useGameSession(fakeGame, 'u1'))
      act(() => result.current.onGameOver(3))

      let ok: boolean | undefined
      await act(async () => { ok = await result.current.onContinue() })

      expect(ok).toBe(false)
      expect(mockShowToast).toHaveBeenCalledWith('Insufficient coins', false)
    })

    it('returns false when game is null', async () => {
      const { result } = renderHook(() => useGameSession(null, 'u1'))
      let ok: boolean | undefined
      await act(async () => { ok = await result.current.onContinue() })
      expect(ok).toBe(false)
      expect(mockService.useContinue).not.toHaveBeenCalled()
    })
  })

  describe('progress (localStorage)', () => {
    it('loadProgress returns 1 when no saved data', () => {
      const { result } = renderHook(() => useGameSession(fakeGame, 'u1'))
      expect(result.current.resumeLevel('tank-invaders')).toBe(1)
    })

    it('saveProgress persists and resumeLevel restores higher level', async () => {
      const { result } = renderHook(() => useGameSession(fakeGame, 'u1'))
      // Complete level 5 → saves 6 as next
      await act(async () => { await result.current.onLevelComplete(5, 0) })
      // Now resume should set startLevel to 6
      act(() => result.current.resumeLevel('tank-invaders'))
      await waitFor(() => expect(result.current.startLevel).toBe(6))
    })
  })
})
