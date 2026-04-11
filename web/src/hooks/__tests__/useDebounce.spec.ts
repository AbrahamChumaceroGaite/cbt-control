import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

vi.mock('@/config/ui', () => ({
  DEBOUNCE_MS: 300,
}))

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello'))
    expect(result.current).toBe('hello')
  })

  it('does not update before the delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v), { initialProps: { v: 'a' } })
    rerender({ v: 'b' })
    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe('a')
  })

  it('updates to the latest value after the delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v), { initialProps: { v: 'a' } })
    rerender({ v: 'b' })
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('b')
  })

  it('only fires once when value changes multiple times within the delay window', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v), { initialProps: { v: 'a' } })
    rerender({ v: 'b' })
    act(() => { vi.advanceTimersByTime(100) })
    rerender({ v: 'c' })
    act(() => { vi.advanceTimersByTime(100) })
    rerender({ v: 'd' })
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('d')
  })

  it('respects a custom delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 500), { initialProps: { v: 'a' } })
    rerender({ v: 'b' })
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('a')
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toBe('b')
  })
})
