import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRecompensas } from '../application/useRecompensas'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/recompensas.service', () => ({
  recompensasService: {
    getAll:  vi.fn(),
    create:  vi.fn(),
    update:  vi.fn(),
    delete:  vi.fn(),
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

import { recompensasService } from '../infrastructure/recompensas.service'
const mockService   = vi.mocked(recompensasService)
const mockShowToast = vi.fn()

const fakeDto = {
  id: 'r1', name: 'Libro de Oro', description: 'Premio especial', icon: '📖',
  coinsRequired: 200, discount: 0, type: 'individual', isGlobal: false, isActive: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getAll.mockResolvedValue([fakeDto])
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useRecompensas', () => {
  describe('load()', () => {
    it('loads rewards on mount and maps them to ViewModels', async () => {
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].name).toBe('Libro de Oro')
      expect(result.current.items[0].finalPrice).toBe(200)
    })

    it('shows error toast when getAll fails', async () => {
      mockService.getAll.mockRejectedValueOnce(new Error('Server error'))
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(mockShowToast).toHaveBeenCalledWith('Server error', false)
    })
  })

  describe('save() — create', () => {
    it('creates a new reward when editing is null', async () => {
      mockService.create.mockResolvedValueOnce({ data: fakeDto, message: 'Creada' })
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: 'Trofeo' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.create).toHaveBeenCalledTimes(1)
      expect(mockShowToast).toHaveBeenCalledWith('Creada')
    })

    it('shows validation error when name is empty', async () => {
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: '   ' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.create).not.toHaveBeenCalled()
      expect(mockShowToast).toHaveBeenCalledWith('Reward name is required', false)
    })
  })

  describe('save() — update', () => {
    it('calls update when editing is set', async () => {
      mockService.update.mockResolvedValueOnce({ data: fakeDto, message: 'Actualizada' })
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openEdit(result.current.items[0]) })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: 'Editada' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.update).toHaveBeenCalledWith('r1', expect.objectContaining({ name: 'Editada' }))
      expect(mockShowToast).toHaveBeenCalledWith('Actualizada')
    })
  })

  describe('doDelete()', () => {
    it('deletes the confirmed reward and reloads', async () => {
      mockService.delete.mockResolvedValueOnce({ data: null, message: 'Eliminada' })
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.requestDelete('r1') })
      await act(() => result.current.handlers.doDelete())

      expect(mockService.delete).toHaveBeenCalledWith('r1')
      expect(mockShowToast).toHaveBeenCalledWith('Eliminada')
      expect(result.current.confirmDeleteId).toBeNull()
    })

    it('does nothing when confirmDeleteId is null', async () => {
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))
      await act(() => result.current.handlers.doDelete())
      expect(mockService.delete).not.toHaveBeenCalled()
    })
  })

  describe('changeType()', () => {
    it('sets isGlobal to true when type changes to class', async () => {
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.changeType('class') })

      expect(result.current.form.type).toBe('class')
      expect(result.current.form.isGlobal).toBe(true)
    })

    it('sets isGlobal to false when type changes to individual', async () => {
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.changeType('individual') })

      expect(result.current.form.type).toBe('individual')
      expect(result.current.form.isGlobal).toBe(false)
    })
  })

  describe('filtering', () => {
    it('filters rewards by search term', async () => {
      mockService.getAll.mockResolvedValueOnce([
        fakeDto,
        { ...fakeDto, id: 'r2', name: 'Trofeo', type: 'class', isGlobal: true },
      ])
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.setSearch('libro') })
      expect(result.current.items.map(i => i.name)).toEqual(['Libro de Oro'])
    })

    it('filters by type', async () => {
      mockService.getAll.mockResolvedValueOnce([
        fakeDto,
        { ...fakeDto, id: 'r2', name: 'Trofeo', type: 'class', isGlobal: true },
      ])
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.setFilter('type', 'class') })
      expect(result.current.items.every(i => i.type === 'class')).toBe(true)
    })

    it('clearFilters resets type and status to all', async () => {
      const { result } = renderHook(() => useRecompensas())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.setFilter('type', 'individual') })
      act(() => { result.current.handlers.clearFilters() })

      expect(result.current.filters.type).toBe('all')
      expect(result.current.filters.status).toBe('all')
    })
  })
})
