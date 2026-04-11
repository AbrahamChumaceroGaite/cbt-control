import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGrupos } from '../application/useGrupos'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/grupos.service', () => ({
  gruposService: {
    getAllCourses:        vi.fn(),
    getStudentsByCourse: vi.fn(),
    getByCourse:         vi.fn(),
    create:              vi.fn(),
    update:              vi.fn(),
    delete:              vi.fn(),
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

import { gruposService } from '../infrastructure/grupos.service'
const mockService   = vi.mocked(gruposService)
const mockShowToast = vi.fn()

const fakeCourse  = { id: 'c1', name: 'Matemáticas', level: 'Secondary 2', parallel: 'A', classCoins: 150 }
const fakeStudent = { id: 's1', name: 'Ana', code: 'A001', email: '', coins: 100, courseId: 'c1', tramos: [] }
const fakeGroup   = { id: 'g1', name: 'Equipo A', courseId: 'c1', members: [{ id: 'gm1', studentId: 's1', student: { id: 's1', name: 'Ana', coins: 100 } }] }

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getAllCourses.mockResolvedValue([fakeCourse])
  mockService.getStudentsByCourse.mockResolvedValue([fakeStudent])
  mockService.getByCourse.mockResolvedValue([fakeGroup])
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useGrupos', () => {
  describe('loadGroups()', () => {
    it('loads groups and students on mount', async () => {
      const { result } = renderHook(() => useGrupos())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].name).toBe('Equipo A')
      expect(result.current.students).toHaveLength(1)
    })

    it('shows error toast when loadGroups fails', async () => {
      mockService.getByCourse.mockRejectedValueOnce(new Error('Server error'))
      const { result } = renderHook(() => useGrupos())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(mockShowToast).toHaveBeenCalledWith('Server error', false)
    })
  })

  describe('save() — create', () => {
    it('creates a new group when editing is null', async () => {
      mockService.create.mockResolvedValueOnce({ data: fakeGroup, message: 'Creado' })
      const { result } = renderHook(() => useGrupos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ name: 'Nuevo Equipo', studentIds: ['s1'] }) })
      await act(() => result.current.handlers.save())

      expect(mockService.create).toHaveBeenCalledTimes(1)
      expect(mockShowToast).toHaveBeenCalledWith('Creado')
    })

    it('shows validation error when name is empty', async () => {
      const { result } = renderHook(() => useGrupos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.setForm({ name: '   ', studentIds: [] }) })
      await act(() => result.current.handlers.save())

      expect(mockService.create).not.toHaveBeenCalled()
      expect(mockShowToast).toHaveBeenCalledWith('Group name is required', false)
    })
  })

  describe('save() — update', () => {
    it('calls update when editing is set', async () => {
      mockService.update.mockResolvedValueOnce({ data: fakeGroup, message: 'Actualizado' })
      const { result } = renderHook(() => useGrupos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openEdit(result.current.items[0]) })
      act(() => { result.current.handlers.setForm({ ...result.current.form, name: 'Editado' }) })
      await act(() => result.current.handlers.save())

      expect(mockService.update).toHaveBeenCalledWith('g1', expect.objectContaining({ name: 'Editado' }))
      expect(mockShowToast).toHaveBeenCalledWith('Actualizado')
    })
  })

  describe('doDelete()', () => {
    it('deletes the confirmed group and reloads', async () => {
      mockService.delete.mockResolvedValueOnce({ data: null, message: 'Eliminado' })
      const { result } = renderHook(() => useGrupos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.requestDelete('g1') })
      await act(() => result.current.handlers.doDelete())

      expect(mockService.delete).toHaveBeenCalledWith('g1')
      expect(mockShowToast).toHaveBeenCalledWith('Eliminado')
      expect(result.current.confirmDeleteId).toBeNull()
    })

    it('does nothing when confirmDeleteId is null', async () => {
      const { result } = renderHook(() => useGrupos())
      await waitFor(() => expect(result.current.loading).toBe(false))
      await act(() => result.current.handlers.doDelete())
      expect(mockService.delete).not.toHaveBeenCalled()
    })
  })

  describe('toggleMember()', () => {
    it('adds a studentId when not already in the form', async () => {
      const { result } = renderHook(() => useGrupos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.toggleMember('s2') })
      expect(result.current.form.studentIds).toContain('s2')
    })

    it('removes a studentId when already in the form', async () => {
      const { result } = renderHook(() => useGrupos())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handlers.openCreate() })
      act(() => { result.current.handlers.toggleMember('s1') })
      act(() => { result.current.handlers.toggleMember('s1') })
      expect(result.current.form.studentIds).not.toContain('s1')
    })
  })
})
