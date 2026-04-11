import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAula } from '../application/useAula'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/aula.service', () => ({
  aulaService: {
    getCourses:          vi.fn(),
    getActions:          vi.fn(),
    getRewards:          vi.fn(),
    getStudentsByCourse: vi.fn(),
    getCourseDetail:     vi.fn(),
    award:               vi.fn(),
  },
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('@/hooks/useSocketEvent', () => ({
  useSocketEvent: vi.fn(),
}))

vi.mock('@/ws/events', () => ({
  WS: { COINS_UPDATED: 'coins:updated' },
}))

import { aulaService } from '../infrastructure/aula.service'
const mockService   = vi.mocked(aulaService)
const mockShowToast = vi.fn()

const fakeCourse  = { id: 'c1', name: 'Matemáticas', level: 'Secondary 2', parallel: 'A', classCoins: 150 }
const fakeStudent = { id: 's1', name: 'Ana', code: 'A001', email: '', coins: 100, courseId: 'c1', tramos: [] }
const fakeAction  = { id: 'act1', name: 'Participación', coins: 3, category: 'blue', affectsClass: true, affectsStudent: true, isActive: true }
const fakeReward  = { id: 'rew1', name: 'Libro', description: '', icon: '📖', coinsRequired: 50, discount: 0, type: 'class', isGlobal: true, isActive: true }
const fakeCourseDetail = { classCoins: 150, coinLogs: [] }

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getCourses.mockResolvedValue([fakeCourse])
  mockService.getActions.mockResolvedValue([fakeAction])
  mockService.getRewards.mockResolvedValue([fakeReward])
  mockService.getStudentsByCourse.mockResolvedValue([fakeStudent])
  mockService.getCourseDetail.mockResolvedValue(fakeCourseDetail as never)
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useAula', () => {
  describe('loadAll()', () => {
    it('loads courses, actions, and rewards on mount', async () => {
      const { result } = renderHook(() => useAula())
      await waitFor(() => expect(result.current.courses).toHaveLength(1))
      expect(result.current.courses[0].name).toBe('Matemáticas')
    })

    it('auto-selects the first course and loads its students', async () => {
      const { result } = renderHook(() => useAula())
      await waitFor(() => expect(result.current.students).toHaveLength(1))
      expect(result.current.courseId).toBe('c1')
      expect(result.current.currentCoins).toBe(150)
    })
  })

  describe('derived data', () => {
    it('classRewards includes only class-type active rewards', async () => {
      const { result } = renderHook(() => useAula())
      await waitFor(() => expect(result.current.classRewards).toHaveLength(1))
      expect(result.current.classRewards[0].name).toBe('Libro')
    })

    it('applicable filters actions by targetMode', async () => {
      const { result } = renderHook(() => useAula())
      await waitFor(() => expect(result.current.applicable).toHaveLength(1))
      // Default targetMode is 'class' — fakeAction affectsClass = true
      expect(result.current.applicable[0].name).toBe('Participación')
    })
  })

  describe('openAward() / closeAward()', () => {
    it('opens award modal and resets step to recipients', async () => {
      const { result } = renderHook(() => useAula())
      await waitFor(() => expect(result.current.courses).toHaveLength(1))

      act(() => { result.current.openAward() })
      expect(result.current.awardOpen).toBe(true)
      expect(result.current.step).toBe('recipients')
    })

    it('closes award modal', async () => {
      const { result } = renderHook(() => useAula())
      await waitFor(() => expect(result.current.courses).toHaveLength(1))

      act(() => { result.current.openAward() })
      act(() => { result.current.closeAward() })
      expect(result.current.awardOpen).toBe(false)
    })
  })

  describe('toggleStudent()', () => {
    it('adds a student to selectedIds', async () => {
      const { result } = renderHook(() => useAula())
      await waitFor(() => expect(result.current.courses).toHaveLength(1))

      act(() => { result.current.toggleStudent('s1') })
      expect(result.current.selectedIds.has('s1')).toBe(true)
    })

    it('removes a student from selectedIds when toggled again', async () => {
      const { result } = renderHook(() => useAula())
      await waitFor(() => expect(result.current.courses).toHaveLength(1))

      act(() => { result.current.toggleStudent('s1') })
      act(() => { result.current.toggleStudent('s1') })
      expect(result.current.selectedIds.has('s1')).toBe(false)
    })
  })

  describe('executeAward()', () => {
    it('awards coins to the class and shows toast', async () => {
      mockService.award.mockResolvedValueOnce({ message: 'Coins awarded', data: null } as never)
      const { result } = renderHook(() => useAula())
      await waitFor(() => expect(result.current.courses).toHaveLength(1))

      act(() => { result.current.openAward() })
      act(() => { result.current.setChosenAction(fakeAction) })
      await act(() => result.current.executeAward())

      expect(mockService.award).toHaveBeenCalledTimes(1)
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('Participación'), true,
      )
    })

    it('shows error toast when award fails', async () => {
      mockService.award.mockRejectedValueOnce(new Error('Award failed'))
      const { result } = renderHook(() => useAula())
      await waitFor(() => expect(result.current.courses).toHaveLength(1))

      act(() => { result.current.openAward() })
      act(() => { result.current.setChosenAction(fakeAction) })
      await act(() => result.current.executeAward())

      expect(mockShowToast).toHaveBeenCalledWith('Award failed', false)
    })
  })
})
