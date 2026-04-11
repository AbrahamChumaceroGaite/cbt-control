import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAcciones } from '../application/useAcciones'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/acciones.service', () => ({
  accionesService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

// usePagination: minimal stub returning stable values
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

import { accionesService } from '../infrastructure/acciones.service'
const mockService  = vi.mocked(accionesService)
const mockShowToast = vi.fn()

const fakeDto = {
  id: 'a1', name: 'Participación', coins: 3,
  category: 'blue', affectsClass: false, affectsStudent: true, isActive: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getAll.mockResolvedValue([fakeDto])
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useAcciones', () => {
  describe('load()', () => {
    it('loads actions on mount and maps them to ViewModels', async () => {
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].name).toBe('Participación')
      expect(result.current.items[0].colorConfig).toBeDefined()
    })

    it('shows error toast when getAll fails', async () => {
      mockService.getAll.mockRejectedValueOnce(new Error('Server error'))
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(mockShowToast).toHaveBeenCalledWith('Server error', false)
    })
  })

  describe('save() — create', () => {
    it('creates a new action when editing is null', async () => {
      mockService.create.mockResolvedValueOnce({ data: fakeDto, message: 'Creada' })
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: 'Nueva acción' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.create).toHaveBeenCalledTimes(1)
      expect(mockShowToast).toHaveBeenCalledWith('Creada')
    })

    it('shows validation error when name is empty', async () => {
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: '   ' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.create).not.toHaveBeenCalled()
      expect(mockShowToast).toHaveBeenCalledWith('Action name is required', false)
    })
  })

  describe('save() — update', () => {
    it('calls update when editing is set', async () => {
      mockService.update.mockResolvedValueOnce({ data: fakeDto, message: 'Actualizada' })
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openEdit(result.current.items[0]) })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: 'Editada' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.update).toHaveBeenCalledWith('a1', expect.objectContaining({ name: 'Editada' }))
      expect(mockShowToast).toHaveBeenCalledWith('Actualizada')
    })

    it('shows error toast when update fails', async () => {
      mockService.update.mockRejectedValueOnce(new Error('Update failed'))
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openEdit(result.current.items[0]) })
      await act(() => result.current.handlers.save())

      expect(mockShowToast).toHaveBeenCalledWith('Update failed', false)
    })
  })

  describe('doDelete()', () => {
    it('deletes the confirmed action and reloads', async () => {
      mockService.delete.mockResolvedValueOnce({ data: null, message: 'Eliminada' })
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.requestDelete('a1') })
      await act(() => result.current.handlers.doDelete())

      expect(mockService.delete).toHaveBeenCalledWith('a1')
      expect(mockShowToast).toHaveBeenCalledWith('Eliminada')
      expect(result.current.confirmDeleteId).toBeNull()
    })

    it('does nothing when confirmDeleteId is null', async () => {
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))
      await act(() => result.current.handlers.doDelete())
      expect(mockService.delete).not.toHaveBeenCalled()
    })
  })

  describe('openCreate() / openEdit()', () => {
    it('opens modal with empty form on openCreate', async () => {
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))
      act(() => { result.current.handlers.openCreate() })
      expect(result.current.modal).toBe(true)
      expect(result.current.editing).toBeNull()
      expect(result.current.form.name).toBe('')
    })

    it('opens modal with populated form on openEdit', async () => {
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))
      act(() => { result.current.handlers.openEdit(result.current.items[0]) })
      expect(result.current.modal).toBe(true)
      expect(result.current.editing?.id).toBe('a1')
      expect(result.current.form.name).toBe('Participación')
    })
  })

  describe('filtering', () => {
    it('filters items by search term (debounced)', async () => {
      mockService.getAll.mockResolvedValueOnce([
        fakeDto,
        { ...fakeDto, id: 'a2', name: 'Tarea' },
      ])
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.setSearch('part') })
      expect(result.current.items.map(i => i.name)).toEqual(['Participación'])
    })

    it('clearFilters resets all filter state', async () => {
      const { result } = renderHook(() => useAcciones())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.setFilter('status', 'active') })
      expect(result.current.filters.status).toBe('active')

      act(() => { result.current.handlers.clearFilters() })
      expect(result.current.filters.status).toBe('all')
    })
  })
})
