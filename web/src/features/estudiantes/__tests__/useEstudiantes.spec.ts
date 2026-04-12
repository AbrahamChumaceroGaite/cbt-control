import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useEstudiantes } from '../application/useEstudiantes'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/estudiantes.service', () => ({
  estudiantesService: {
    getAllCourses: vi.fn(),
    getByCourse:  vi.fn(),
    create:       vi.fn(),
    update:       vi.fn(),
    delete:       vi.fn(),
    import:       vi.fn(),
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

// xlsx is a heavy dependency — mock it entirely so tests don't need the real parser
vi.mock('xlsx', () => ({
  read:  vi.fn(),
  utils: { sheet_to_json: vi.fn() },
}))

import { estudiantesService } from '../infrastructure/estudiantes.service'
const mockService   = vi.mocked(estudiantesService)
const mockShowToast = vi.fn()

const fakeCourse  = { id: 'c1', name: 'Matemáticas', level: 'Secondary 2', parallel: 'A', classCoins: 150 }
const fakeStudent = { id: 's1', name: 'Ana García', code: 'A001', email: 'ana@school.edu', coins: 120, courseId: 'c1', tramos: [] }

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getAllCourses.mockResolvedValue([fakeCourse])
  mockService.getByCourse.mockResolvedValue([fakeStudent])
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useEstudiantes', () => {
  describe('load()', () => {
    it('loads students once a course is selected', async () => {
      const { result } = renderHook(() => useEstudiantes())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].name).toBe('Ana García')
    })

    it('loads the list of courses on mount', async () => {
      const { result } = renderHook(() => useEstudiantes())
      await waitFor(() => expect(result.current.courses).toHaveLength(1))
      expect(result.current.courses[0].name).toBe('Matemáticas')
    })

    it('shows error toast when getByCourse fails', async () => {
      mockService.getByCourse.mockRejectedValueOnce(new Error('Server error'))
      const { result } = renderHook(() => useEstudiantes())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(mockShowToast).toHaveBeenCalledWith('Server error', false)
    })
  })

  describe('save() — create', () => {
    it('creates a new student in the current course', async () => {
      mockService.create.mockResolvedValueOnce({ data: fakeStudent, message: 'Creado' })
      const { result } = renderHook(() => useEstudiantes())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: 'Pedro' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.create).toHaveBeenCalledTimes(1)
      expect(mockShowToast).toHaveBeenCalledWith('Creado')
    })

    it('shows validation error when name is empty', async () => {
      const { result } = renderHook(() => useEstudiantes())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: '   ' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.create).not.toHaveBeenCalled()
      expect(mockShowToast).toHaveBeenCalledWith('Student name is required', false)
    })
  })

  describe('save() — update', () => {
    it('calls update when editing is set', async () => {
      mockService.update.mockResolvedValueOnce({ data: fakeStudent, message: 'Actualizado' })
      const { result } = renderHook(() => useEstudiantes())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openEdit(result.current.items[0]) })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: 'Editado' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.update).toHaveBeenCalledWith('s1', expect.objectContaining({ name: 'Editado' }))
      expect(mockShowToast).toHaveBeenCalledWith('Actualizado')
    })
  })

  describe('doDelete()', () => {
    it('deletes the confirmed student and reloads', async () => {
      mockService.delete.mockResolvedValueOnce({ data: null, message: 'Eliminado' })
      const { result } = renderHook(() => useEstudiantes())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.requestDelete('s1') })
      await act(() => result.current.handlers.doDelete())

      expect(mockService.delete).toHaveBeenCalledWith('s1')
      expect(mockShowToast).toHaveBeenCalledWith('Eliminado')
      expect(result.current.confirmDeleteId).toBeNull()
    })

    it('does nothing when confirmDeleteId is null', async () => {
      const { result } = renderHook(() => useEstudiantes())
      await waitFor(() => expect(result.current.loading).toBe(false))
      await act(() => result.current.handlers.doDelete())
      expect(mockService.delete).not.toHaveBeenCalled()
    })
  })

  describe('search and filters', () => {
    it('filters by search term matching name or code', async () => {
      mockService.getByCourse.mockResolvedValueOnce([
        fakeStudent,
        { ...fakeStudent, id: 's2', name: 'Pedro Pérez', code: 'B002' },
      ])
      const { result } = renderHook(() => useEstudiantes())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.setSearch('pedro') })
      expect(result.current.items.map(s => s.name)).toEqual(['Pedro Pérez'])
    })

    it('clearFilters resets all filters', async () => {
      const { result } = renderHook(() => useEstudiantes())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.setFilters(p => ({ ...p, coinMax: 100 })) })
      act(() => { result.current.handlers.clearFilters() })

      expect(result.current.filters.coinMax).toBeNull()
    })
  })
})
