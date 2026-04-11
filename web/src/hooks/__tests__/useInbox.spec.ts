import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useInbox } from '../useInbox'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('@/features/notifications/infrastructure/notifications.service', () => ({
  notificationsService: {
    getAll:      vi.fn(),
    markRead:    vi.fn(),
    markAllRead: vi.fn(),
    deleteOne:   vi.fn(),
    deleteAll:   vi.fn(),
  },
}))

// useInterval: run callback immediately on first call so tests don't have to advance timers
vi.mock('@/hooks/useInterval', () => ({
  useInterval: (cb: () => void, delay: number | null) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useEffect } = require('react')
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (delay !== null) cb() }, [])
  },
}))

vi.mock('@/config/ui', () => ({
  POLL_MS: 30000,
}))

import { notificationsService } from '@/features/notifications/infrastructure/notifications.service'
const mockService = vi.mocked(notificationsService)

const fakeItems = [
  { id: 'n1', title: 'Coins awarded', body: '', url: '', tag: '', isRead: false, createdAt: '' },
  { id: 'n2', title: 'Reward claimed', body: '', url: '', tag: '', isRead: true,  createdAt: '' },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getAll.mockResolvedValue({ items: fakeItems, unreadCount: 1 })
  mockService.markRead.mockResolvedValue(undefined as never)
  mockService.markAllRead.mockResolvedValue(undefined as never)
  mockService.deleteOne.mockResolvedValue(undefined as never)
  mockService.deleteAll.mockResolvedValue(undefined as never)
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useInbox', () => {
  describe('refresh()', () => {
    it('loads items and unread count', async () => {
      const { result } = renderHook(() => useInbox())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.items).toHaveLength(2)
      expect(result.current.unreadCount).toBe(1)
    })

    it('sets error state when getAll fails', async () => {
      mockService.getAll.mockRejectedValueOnce(new Error('Network error'))
      const { result } = renderHook(() => useInbox())
      await waitFor(() => expect(result.current.error).toBe('Network error'))
    })
  })

  describe('markRead()', () => {
    it('marks an item as read and decrements unreadCount', async () => {
      const { result } = renderHook(() => useInbox())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.markRead('n1'))

      const updated = result.current.items.find(n => n.id === 'n1')
      expect(updated?.isRead).toBe(true)
      expect(result.current.unreadCount).toBe(0)
    })

    it('does not decrement unreadCount when marking an already-read item', async () => {
      const { result } = renderHook(() => useInbox())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.markRead('n2')) // n2 is already read
      expect(result.current.unreadCount).toBe(1) // unchanged
    })
  })

  describe('markAllRead()', () => {
    it('marks all items as read and sets unreadCount to 0', async () => {
      const { result } = renderHook(() => useInbox())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.markAllRead())

      expect(result.current.items.every(n => n.isRead)).toBe(true)
      expect(result.current.unreadCount).toBe(0)
    })
  })

  describe('deleteOne()', () => {
    it('removes the item from the list', async () => {
      const { result } = renderHook(() => useInbox())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.deleteOne('n1'))

      expect(result.current.items.find(n => n.id === 'n1')).toBeUndefined()
    })

    it('decrements unreadCount when deleting an unread item', async () => {
      const { result } = renderHook(() => useInbox())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.deleteOne('n1')) // n1 is unread
      expect(result.current.unreadCount).toBe(0)
    })
  })

  describe('deleteAll()', () => {
    it('clears all items and sets unreadCount to 0', async () => {
      const { result } = renderHook(() => useInbox())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.deleteAll())

      expect(result.current.items).toHaveLength(0)
      expect(result.current.unreadCount).toBe(0)
    })
  })
})
