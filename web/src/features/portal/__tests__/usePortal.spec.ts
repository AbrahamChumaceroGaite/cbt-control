import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePortal } from '../application/usePortal'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/portal.service', () => ({
  portalService: {
    getMe:          vi.fn(),
    getRewards:     vi.fn(),
    requestReward:  vi.fn(),
  },
}))

vi.mock('@/services/auth.service', () => ({
  authService: {
    logout: vi.fn(),
  },
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('@/hooks/usePushNotifications', () => ({
  usePushNotifications: () => ({ unsubscribeForLogout: vi.fn().mockResolvedValue(undefined) }),
}))

// Capture socket handlers so we can invoke them in tests
const socketHandlers: Record<string, (p: unknown) => void> = {}
vi.mock('@/hooks/useSocketEvent', () => ({
  useSocketEvent: vi.fn().mockImplementation((event: string, handler: (p: unknown) => void) => {
    socketHandlers[event] = handler
  }),
}))

vi.mock('@/ws/events', () => ({
  WS: { COINS_UPDATED: 'coins:updated', SOLICITUD_UPDATED: 'solicitud:updated' },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('@/config/routes', () => ({
  APP_ROUTES: { LOGIN: '/login' },
}))

import { portalService } from '../infrastructure/portal.service'
import { authService }   from '@/services/auth.service'
const mockService   = vi.mocked(portalService)
const mockAuth      = vi.mocked(authService)
const mockShowToast = vi.fn()
const mockPush      = vi.fn()

const fakeStudent = {
  id: 's1', name: 'Ana', code: 'A001', coins: 200, email: '',
  courseId: 'c1', avatarUrl: null, bannerUrl: null,
  redemptionRequests: [],
  coinLogs: [], weeklyHistory: [], nextReward: null,
}
const fakeReward = {
  id: 'r1', name: 'Libro', description: '', icon: '📖',
  coinsRequired: 100, discount: 0, finalPrice: 100, type: 'individual', isGlobal: false, isActive: true,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getMe.mockResolvedValue(fakeStudent as never)
  mockService.getRewards.mockResolvedValue([fakeReward])
  mockAuth.logout.mockResolvedValue(undefined as never)
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('usePortal', () => {
  describe('load()', () => {
    it('loads student and rewards on mount', async () => {
      const { result } = renderHook(() => usePortal())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.student?.name).toBe('Ana')
      expect(result.current.rewards).toHaveLength(1)
    })
  })

  describe('onCoinsUpdate()', () => {
    it('updates student coins', async () => {
      const { result } = renderHook(() => usePortal())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.onCoinsUpdate(150) })
      expect(result.current.student?.coins).toBe(150)
    })
  })

  describe('onStudentUpdate()', () => {
    it('merges partial updates into the student', async () => {
      const { result } = renderHook(() => usePortal())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.onStudentUpdate({ name: 'Ana Editada' }) })
      expect(result.current.student?.name).toBe('Ana Editada')
    })
  })

  describe('requestReward()', () => {
    it('requests a reward, shows toast, and reloads student', async () => {
      mockService.requestReward.mockResolvedValueOnce({ data: null, message: 'Solicitada' })
      mockService.getMe.mockResolvedValueOnce(fakeStudent as never).mockResolvedValueOnce(fakeStudent as never)
      const { result } = renderHook(() => usePortal())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.requestReward('r1'))

      expect(mockService.requestReward).toHaveBeenCalledWith('r1')
      expect(mockShowToast).toHaveBeenCalledWith('Solicitada')
      expect(result.current.requesting).toBeNull()
    })

    it('shows error toast when requestReward fails', async () => {
      mockService.requestReward.mockRejectedValueOnce(new Error('Request failed'))
      const { result } = renderHook(() => usePortal())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.requestReward('r1'))
      expect(mockShowToast).toHaveBeenCalledWith('Request failed', false)
    })
  })

  describe('logout()', () => {
    it('calls auth logout and navigates to login', async () => {
      const { result } = renderHook(() => usePortal())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.logout())

      expect(mockAuth.logout).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('tab navigation', () => {
    it('defaults to perfil tab', async () => {
      const { result } = renderHook(() => usePortal())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.tab).toBe('perfil')
    })

    it('changes tab when setTab is called', async () => {
      const { result } = renderHook(() => usePortal())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.setTab('bank') })
      expect(result.current.tab).toBe('bank')
    })
  })

  describe('reloadStudent()', () => {
    it('refreshes student data from the server', async () => {
      mockService.getMe
        .mockResolvedValueOnce(fakeStudent as never)
        .mockResolvedValueOnce({ ...fakeStudent, coins: 350 } as never)
      const { result } = renderHook(() => usePortal())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.reloadStudent())
      expect(result.current.student?.coins).toBe(350)
    })
  })

  describe('socket event handlers', () => {
    it('COINS_UPDATED updates student coins when studentId matches', async () => {
      const { result } = renderHook(() => usePortal())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { socketHandlers['coins:updated']?.({ studentId: 's1', studentCoins: 175 }) })
      expect(result.current.student?.coins).toBe(175)
    })

    it('SOLICITUD_UPDATED updates the status of the matching redemption request', async () => {
      const studentWithRequest = {
        ...fakeStudent,
        redemptionRequests: [{ id: 'req1', status: 'pending', rewardName: 'Libro', requestedAt: '' }],
      }
      mockService.getMe.mockResolvedValueOnce(studentWithRequest as never)
      const { result } = renderHook(() => usePortal())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { socketHandlers['solicitud:updated']?.({ id: 'req1', status: 'approved' }) })
      const updated = result.current.student?.redemptionRequests.find(r => r.id === 'req1')
      expect(updated?.status).toBe('approved')
    })
  })
})
