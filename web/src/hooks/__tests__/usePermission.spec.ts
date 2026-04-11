import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePermission } from '../usePermission'

vi.mock('@/config/roles', () => ({
  ROLES: { ADMIN: 'admin', TEACHER: 'teacher', STUDENT: 'student' },
}))

let mockUser: { role: string } | null = null

vi.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: (s: { user: unknown }) => unknown) =>
    selector({ user: mockUser }),
}))

describe('usePermission', () => {
  it('isAdmin is false when no user is logged in', () => {
    mockUser = null
    const { result } = renderHook(() => usePermission())
    expect(result.current.isAdmin).toBe(false)
    expect(result.current.isStudent).toBe(false)
  })

  it('isAdmin is true when user role is admin', () => {
    mockUser = { role: 'admin' }
    const { result } = renderHook(() => usePermission())
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isStudent).toBe(false)
  })

  it('isStudent is true when user role is student', () => {
    mockUser = { role: 'student' }
    const { result } = renderHook(() => usePermission())
    expect(result.current.isStudent).toBe(true)
    expect(result.current.isAdmin).toBe(false)
  })

  it('hasRole returns true for the matching role', () => {
    mockUser = { role: 'admin' }
    const { result } = renderHook(() => usePermission())
    expect(result.current.hasRole('admin')).toBe(true)
    expect(result.current.hasRole('student')).toBe(false)
  })

  it('can() is an alias for hasRole()', () => {
    mockUser = { role: 'admin' }
    const { result } = renderHook(() => usePermission())
    expect(result.current.can('admin')).toBe(true)
    expect(result.current.can('student')).toBe(false)
  })
})
