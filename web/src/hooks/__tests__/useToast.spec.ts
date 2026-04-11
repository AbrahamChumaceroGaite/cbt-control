import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '../useToast'

vi.mock('@/store/ui.store', () => ({
  useUiStore: (selector: (s: { addToast: unknown; removeToast: unknown }) => unknown) =>
    selector({ addToast: mockAddToast, removeToast: mockRemoveToast }),
}))

vi.mock('@/config/ui', () => ({
  TOAST_MS: 3000,
}))

const mockAddToast    = vi.fn(() => 'toast-id-1')
const mockRemoveToast = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
})
afterEach(() => { vi.useRealTimers() })

describe('useToast', () => {
  it('calls addToast with message and success=true by default', () => {
    const { result } = renderHook(() => useToast())
    act(() => { result.current.showToast('Action created') })
    expect(mockAddToast).toHaveBeenCalledWith('Action created', true)
  })

  it('calls addToast with success=false when explicitly passed', () => {
    const { result } = renderHook(() => useToast())
    act(() => { result.current.showToast('Error occurred', false) })
    expect(mockAddToast).toHaveBeenCalledWith('Error occurred', false)
  })

  it('calls removeToast after TOAST_MS milliseconds', () => {
    const { result } = renderHook(() => useToast())
    act(() => { result.current.showToast('Hello') })
    act(() => { vi.advanceTimersByTime(3000) })
    expect(mockRemoveToast).toHaveBeenCalledWith('toast-id-1')
  })

  it('does not remove toast before TOAST_MS elapses', () => {
    const { result } = renderHook(() => useToast())
    act(() => { result.current.showToast('Hello') })
    act(() => { vi.advanceTimersByTime(1000) })
    expect(mockRemoveToast).not.toHaveBeenCalled()
  })
})
