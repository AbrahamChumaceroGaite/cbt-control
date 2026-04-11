import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'

const mockSetUser = vi.fn()
const mockLogout  = vi.fn()
let mockUser: unknown = null

vi.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: (s: { user: unknown; setUser: unknown; logout: unknown }) => unknown) =>
    selector({ user: mockUser, setUser: mockSetUser, logout: mockLogout }),
}))

describe('useAuth', () => {
  it('returns null user and isAuthenticated=false when not logged in', () => {
    mockUser = null
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('returns user and isAuthenticated=true when logged in', () => {
    mockUser = { id: 'u1', role: 'admin', code: 'A001', fullName: 'Admin' }
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).not.toBeNull()
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('exposes setUser from the store', () => {
    mockUser = null
    const { result } = renderHook(() => useAuth())
    act(() => { result.current.setUser({ id: 'u1', role: 'admin', code: 'A001', fullName: 'Admin' } as never) })
    expect(mockSetUser).toHaveBeenCalledTimes(1)
  })

  it('exposes logout from the store', () => {
    mockUser = { id: 'u1', role: 'admin', code: 'A001', fullName: 'Admin' }
    const { result } = renderHook(() => useAuth())
    act(() => { result.current.logout() })
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
