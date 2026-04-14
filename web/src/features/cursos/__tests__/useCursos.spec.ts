import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCursos } from '../application/useCursos'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/cursos.service', () => ({
  cursosService: {
    getAll:  vi.fn(),
    get:     vi.fn(),
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

import { cursosService } from '../infrastructure/cursos.service'
const mockService   = vi.mocked(cursosService)
const mockShowToast = vi.fn()

const fakeCourse = { id: 'c1', name: 'Matemáticas', level: 'Secondary 2', parallel: 'A', classCoins: 150 }

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getAll.mockResolvedValue([fakeCourse])
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useCursos', () => {
  describe('load()', () => {
    it('loads courses on mount and maps them to ViewModels', async () => {
      const { result } = renderHook(() => useCursos())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].name).toBe('Matemáticas')
    })

    it('shows error toast when getAll fails', async () => {
      mockService.getAll.mockRejectedValueOnce(new Error('Server error'))
      const { result } = renderHook(() => useCursos())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(mockShowToast).toHaveBeenCalledWith('Server error', false)
    })
  })

  describe('save() — create', () => {
    it('creates a new course when editing is null', async () => {
      mockService.create.mockResolvedValueOnce({ data: fakeCourse, message: 'Creado' })
      const { result } = renderHook(() => useCursos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: 'Física' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.create).toHaveBeenCalledTimes(1)
      expect(mockShowToast).toHaveBeenCalledWith('Creado')
    })

    it('shows validation error when name is empty', async () => {
      const { result } = renderHook(() => useCursos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: '   ' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.create).not.toHaveBeenCalled()
      expect(result.current.formErrors.name).toBe('Course name must be at least 2 characters')
    })
  })

  describe('save() — update', () => {
    it('calls update when editing is set', async () => {
      mockService.update.mockResolvedValueOnce({ data: fakeCourse, message: 'Actualizado' })
      const { result } = renderHook(() => useCursos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openEdit(result.current.items[0]) })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: 'Editado' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.update).toHaveBeenCalledWith('c1', expect.objectContaining({ name: 'Editado' }))
      expect(mockShowToast).toHaveBeenCalledWith('Actualizado')
    })

    it('shows error toast when update fails', async () => {
      mockService.update.mockRejectedValueOnce(new Error('Update failed'))
      const { result } = renderHook(() => useCursos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openEdit(result.current.items[0]) })
      await act(() => result.current.handlers.save())

      expect(mockShowToast).toHaveBeenCalledWith('Update failed', false)
    })
  })

  describe('doDelete()', () => {
    it('deletes the confirmed course and reloads', async () => {
      mockService.delete.mockResolvedValueOnce({ data: null, message: 'Eliminado' })
      const { result } = renderHook(() => useCursos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.requestDelete('c1') })
      await act(() => result.current.handlers.doDelete())

      expect(mockService.delete).toHaveBeenCalledWith('c1')
      expect(mockShowToast).toHaveBeenCalledWith('Eliminado')
      expect(result.current.confirmDeleteId).toBeNull()
    })

    it('does nothing when confirmDeleteId is null', async () => {
      const { result } = renderHook(() => useCursos())
      await waitFor(() => expect(result.current.loading).toBe(false))
      await act(() => result.current.handlers.doDelete())
      expect(mockService.delete).not.toHaveBeenCalled()
    })
  })

  describe('openCreate() / openEdit()', () => {
    it('opens modal with empty form on openCreate', async () => {
      const { result } = renderHook(() => useCursos())
      await waitFor(() => expect(result.current.loading).toBe(false))
      act(() => { result.current.handlers.openCreate() })
      expect(result.current.modal).toBe(true)
      expect(result.current.editing).toBeNull()
      expect(result.current.form.name).toBe('')
    })

    it('opens modal with populated form on openEdit', async () => {
      const { result } = renderHook(() => useCursos())
      await waitFor(() => expect(result.current.loading).toBe(false))
      act(() => { result.current.handlers.openEdit(result.current.items[0]) })
      expect(result.current.modal).toBe(true)
      expect(result.current.editing?.id).toBe('c1')
      expect(result.current.form.name).toBe('Matemáticas')
    })
  })

  describe('search filter', () => {
    it('filters courses by search term', async () => {
      mockService.getAll.mockResolvedValueOnce([
        fakeCourse,
        { ...fakeCourse, id: 'c2', name: 'Física' },
      ])
      const { result } = renderHook(() => useCursos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.setSearch('mat') })
      expect(result.current.items.map(i => i.name)).toEqual(['Matemáticas'])
    })
  })
})
