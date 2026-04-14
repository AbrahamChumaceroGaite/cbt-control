import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useUsuarios } from '../application/useUsuarios'
import type { UserDetailResponse } from '@control-aula/shared'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/usuarios.service', () => ({
  usuariosService: {
    getAll:  vi.fn(),
    create:  vi.fn(),
    update:  vi.fn(),
    delete:  vi.fn(),
    getUserInbox:           vi.fn(),
    getStudentTransactions: vi.fn(),
  },
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('@/hooks/usePagination', () => ({
  usePagination: () => ({
    page: 0, pageSize: 10, setPage: vi.fn(), setPageSize: vi.fn(),
    totalPages: (n: number) => Math.ceil(n / 10),
    reset: vi.fn(),
  }),
}))

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (v: string) => v,
}))

import { usuariosService } from '../infrastructure/usuarios.service'
const mockService   = vi.mocked(usuariosService)
const mockShowToast = vi.fn()

const fakeUser: UserDetailResponse = {
  id: 'u1', code: 'T001', fullName: 'María López', role: 'admin',
  isActive: true, pushSubscriptionCount: 2, notificationCount: 0,
  createdAt: '2024-01-01T00:00:00.000Z', student: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getAll.mockResolvedValue([fakeUser])
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useUsuarios', () => {
  describe('load()', () => {
    it('loads users on mount and maps them to ViewModels', async () => {
      const { result } = renderHook(() => useUsuarios())
      await waitFor(() => expect(result.current.paginated).toHaveLength(1))
      expect(result.current.paginated[0].displayName).toBe('María López')
      expect(result.current.paginated[0].hasPush).toBe(true)
    })

    it('does not throw on load failure (silent)', async () => {
      mockService.getAll.mockRejectedValueOnce(new Error('Network error'))
      const { result } = renderHook(() => useUsuarios())
      await waitFor(() => expect(result.current.paginated).toHaveLength(0))
      expect(mockShowToast).not.toHaveBeenCalled()
    })
  })

  describe('create()', () => {
    it('creates a user and reloads', async () => {
      mockService.create.mockResolvedValueOnce({ data: fakeUser, message: 'Creado' })
      const { result } = renderHook(() => useUsuarios())
      await waitFor(() => expect(result.current.paginated).toHaveLength(1))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ code: 'T002', password: 'pass', role: 'teacher', fullName: 'Ana' }) })
      await act(() => result.current.handlers.create())

      expect(mockService.create).toHaveBeenCalledTimes(1)
      expect(mockShowToast).toHaveBeenCalledWith('Creado')
      expect(result.current.modal).toBe(false)
    })

    it('shows error toast when create fails', async () => {
      mockService.create.mockRejectedValueOnce(new Error('Create failed'))
      const { result } = renderHook(() => useUsuarios())
      await waitFor(() => expect(result.current.paginated).toHaveLength(1))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ code: 'T003', password: 'pass', role: 'teacher', fullName: 'Error User' }) })
      await act(() => result.current.handlers.create())

      expect(mockShowToast).toHaveBeenCalledWith('Create failed', false)
    })
  })

  describe('filtering', () => {
    it('filters users by search term on code or displayName', async () => {
      mockService.getAll.mockResolvedValueOnce([
        fakeUser,
        { ...fakeUser, id: 'u2', code: 'S001', fullName: 'Pedro Pérez', role: 'student' },
      ])
      const { result } = renderHook(() => useUsuarios())
      await waitFor(() => expect(result.current.paginated).toHaveLength(2))

      act(() => { result.current.handlers.setSearch('pedro') })
      expect(result.current.paginated.map(u => u.code)).toEqual(['S001'])
    })

    it('filters by role', async () => {
      mockService.getAll.mockResolvedValueOnce([
        fakeUser,
        { ...fakeUser, id: 'u2', code: 'S001', role: 'student' },
      ])
      const { result } = renderHook(() => useUsuarios())
      await waitFor(() => expect(result.current.paginated).toHaveLength(2))

      act(() => { result.current.handlers.updateFilter('role', 'admin') })
      expect(result.current.paginated.every(u => u.role === 'admin')).toBe(true)
    })

    it('clearFilters resets all filters', async () => {
      const { result } = renderHook(() => useUsuarios())
      await waitFor(() => expect(result.current.paginated).toHaveLength(1))

      act(() => { result.current.handlers.updateFilter('role', 'admin') })
      act(() => { result.current.handlers.clearFilters() })

      expect(result.current.filters.role).toBe('all')
      expect(result.current.filtersActive).toBe(false)
    })
  })

  describe('selectUser() / closeDrawer()', () => {
    it('sets selected user on selectUser', async () => {
      const { result } = renderHook(() => useUsuarios())
      await waitFor(() => expect(result.current.paginated).toHaveLength(1))

      act(() => { result.current.handlers.selectUser(result.current.paginated[0]) })
      expect(result.current.selected?.id).toBe('u1')
    })

    it('clears selected user on closeDrawer', async () => {
      const { result } = renderHook(() => useUsuarios())
      await waitFor(() => expect(result.current.paginated).toHaveLength(1))

      act(() => { result.current.handlers.selectUser(result.current.paginated[0]) })
      act(() => { result.current.handlers.closeDrawer() })
      expect(result.current.selected).toBeNull()
    })
  })
})
