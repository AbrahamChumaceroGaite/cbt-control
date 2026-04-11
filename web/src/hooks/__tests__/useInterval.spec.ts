import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInterval } from '../useInterval'

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('useInterval', () => {
  it('calls callback after the specified delay', () => {
    const cb = vi.fn()
    renderHook(() => useInterval(cb, 1000))
    vi.advanceTimersByTime(1000)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('calls callback repeatedly on each interval tick', () => {
    const cb = vi.fn()
    renderHook(() => useInterval(cb, 500))
    vi.advanceTimersByTime(2000)
    expect(cb).toHaveBeenCalledTimes(4)
  })

  it('does not call callback when delay is null', () => {
    const cb = vi.fn()
    renderHook(() => useInterval(cb, null))
    vi.advanceTimersByTime(5000)
    expect(cb).not.toHaveBeenCalled()
  })

  it('clears the interval when the component unmounts', () => {
    const cb = vi.fn()
    const { unmount } = renderHook(() => useInterval(cb, 1000))
    vi.advanceTimersByTime(500)
    unmount()
    vi.advanceTimersByTime(1000)
    expect(cb).not.toHaveBeenCalled()
  })

  it('always calls the latest version of the callback', () => {
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    const { rerender } = renderHook(({ fn }) => useInterval(fn, 1000), { initialProps: { fn: cb1 } })
    rerender({ fn: cb2 })
    vi.advanceTimersByTime(1000)
    expect(cb1).not.toHaveBeenCalled()
    expect(cb2).toHaveBeenCalledTimes(1)
  })
})
