import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSocketEvent } from '../useSocketEvent'

const mockOn = vi.fn(() => vi.fn()) // returns an unsubscribe fn

vi.mock('@/contexts/SocketContext', () => ({
  useWs: () => ({ on: mockOn }),
}))

vi.mock('@/ws/events', () => ({
  WS: { COINS_UPDATED: 'coins:updated' },
}))

describe('useSocketEvent', () => {
  it('registers a handler for the given event on mount', () => {
    const handler = vi.fn()
    renderHook(() => useSocketEvent('coins:updated' as never, handler))
    expect(mockOn).toHaveBeenCalledWith('coins:updated', handler)
  })

  it('returns the unsubscribe function from useEffect cleanup', () => {
    const unsubscribe = vi.fn()
    mockOn.mockReturnValueOnce(unsubscribe)
    const handler = vi.fn()
    const { unmount } = renderHook(() => useSocketEvent('coins:updated' as never, handler))
    unmount()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
