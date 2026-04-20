import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor }              from '@testing-library/react'
import type { GameResponse, LevelResponse }       from '@control-aula/shared'

vi.mock('../../infrastructure/games.service', () => ({
  gamesService: {
    getAll:         vi.fn(),
    getBySlug:      vi.fn(),
    getLevels:      vi.fn(),
    update:         vi.fn(),
    completeLevel:  vi.fn(),
    useContinue:    vi.fn(),
  },
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('@/store/auth.store', () => ({
  useAuthStore: (sel: (s: { user: null }) => null) => sel({ user: null }),
}))

import { useGames }      from '../useGames'
import { gamesService }  from '../../infrastructure/games.service'

const mockService   = vi.mocked(gamesService)
const mockShowToast = vi.fn()

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

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getAll.mockResolvedValue([fakeGame])
  mockService.getLevels.mockResolvedValue([fakeLevel])
})

describe('useGames', () => {
  describe('load()', () => {
    it('loads and maps games on mount', async () => {
      const { result } = renderHook(() => useGames())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.games).toHaveLength(1)
      expect(result.current.games[0].coinsAtMaxLevel).toBe(63)
    })

    it('shows error toast when getAll fails', async () => {
      mockService.getAll.mockRejectedValueOnce(new Error('Network error'))
      const { result } = renderHook(() => useGames())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(mockShowToast).toHaveBeenCalledWith('Network error', false)
    })
  })

  describe('selectGame()', () => {
    it('sets selectedGame and loads levels', async () => {
      const { result } = renderHook(() => useGames())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.handlers.selectGame(result.current.games[0])
      })

      expect(result.current.selectedGame?.id).toBe('g1')
      expect(result.current.levels).toHaveLength(1)
      expect(result.current.levels[0].tier).toBe('Tutorial')
    })

    it('shows error toast when getLevels fails', async () => {
      mockService.getLevels.mockRejectedValueOnce(new Error('Levels error'))
      const { result } = renderHook(() => useGames())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.handlers.selectGame(result.current.games[0])
      })

      expect(mockShowToast).toHaveBeenCalledWith('Levels error', false)
    })
  })

  describe('clearSelection()', () => {
    it('clears selectedGame, levels, and playing', async () => {
      const { result } = renderHook(() => useGames())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.handlers.selectGame(result.current.games[0])
      })
      expect(result.current.selectedGame).not.toBeNull()

      act(() => result.current.handlers.startPlaying())
      expect(result.current.playing).toBe(true)

      act(() => result.current.handlers.clearSelection())
      expect(result.current.selectedGame).toBeNull()
      expect(result.current.levels).toHaveLength(0)
      expect(result.current.playing).toBe(false)
    })
  })

  describe('startPlaying() / stopPlaying()', () => {
    it('sets playing to true on startPlaying', () => {
      const { result } = renderHook(() => useGames())
      act(() => result.current.handlers.startPlaying())
      expect(result.current.playing).toBe(true)
    })

    it('sets playing to false on stopPlaying', () => {
      const { result } = renderHook(() => useGames())
      act(() => result.current.handlers.startPlaying())
      act(() => result.current.handlers.stopPlaying())
      expect(result.current.playing).toBe(false)
    })
  })

  describe('openEdit() / closeEdit()', () => {
    it('sets editing to the game and populates editForm', async () => {
      const { result } = renderHook(() => useGames())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => result.current.handlers.openEdit(result.current.games[0]))

      expect(result.current.editing?.id).toBe('g1')
      expect(result.current.editForm.title).toBe('Tank Invaders')
      expect(result.current.editForm.coinsPerLevelBase).toBe(5)
    })

    it('clears editing on closeEdit', async () => {
      const { result } = renderHook(() => useGames())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => result.current.handlers.openEdit(result.current.games[0]))
      act(() => result.current.handlers.closeEdit())

      expect(result.current.editing).toBeNull()
    })
  })

  describe('saveEdit()', () => {
    it('calls update, updates games list, and shows success toast', async () => {
      const updatedGame: GameResponse = { ...fakeGame, title: 'Updated Title' }
      mockService.update.mockResolvedValueOnce(updatedGame)

      const { result } = renderHook(() => useGames())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => result.current.handlers.openEdit(result.current.games[0]))

      await act(async () => { await result.current.handlers.saveEdit() })

      expect(mockService.update).toHaveBeenCalledWith('g1', expect.objectContaining({ title: 'Tank Invaders' }))
      expect(result.current.games[0].title).toBe('Updated Title')
      expect(mockShowToast).toHaveBeenCalledWith('Game updated')
      expect(result.current.editing).toBeNull()
    })

    it('shows error toast when update fails', async () => {
      mockService.update.mockRejectedValueOnce(new Error('Save failed'))

      const { result } = renderHook(() => useGames())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => result.current.handlers.openEdit(result.current.games[0]))

      await act(async () => { await result.current.handlers.saveEdit() })

      expect(mockShowToast).toHaveBeenCalledWith('Save failed', false)
    })

    it('does nothing when editing is null', async () => {
      const { result } = renderHook(() => useGames())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => { await result.current.handlers.saveEdit() })

      expect(mockService.update).not.toHaveBeenCalled()
    })
  })
})
