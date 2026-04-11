import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSolicitudes } from '../application/useSolicitudes'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/solicitudes.service', () => ({
  solicitudesService: {
    getAll:  vi.fn(),
    process: vi.fn(),
    delete:  vi.fn(),
  },
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('@/config/status', () => ({
  REQUEST_STATUS: { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' },
}))

import { solicitudesService } from '../infrastructure/solicitudes.service'
const mockService   = vi.mocked(solicitudesService)
const mockShowToast = vi.fn()

const fakePending  = { id: 'sol1', status: 'pending',  rewardName: 'Libro', studentName: 'Ana', coins: 100, requestedAt: '' }
const fakeApproved = { id: 'sol2', status: 'approved', rewardName: 'Trofeo', studentName: 'Pedro', coins: 200, requestedAt: '' }

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getAll.mockResolvedValue([fakePending, fakeApproved] as never)
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useSolicitudes', () => {
  describe('load()', () => {
    it('loads all items and filters to pending by default', async () => {
      const { result } = renderHook(() => useSolicitudes())
      await waitFor(() => expect(result.current.visible).toHaveLength(1))
      expect(result.current.visible[0].status).toBe('pending')
    })

    it('calls onCountChange with pending count after loading', async () => {
      const onCountChange = vi.fn()
      renderHook(() => useSolicitudes({ onCountChange }))
      await waitFor(() => expect(onCountChange).toHaveBeenCalledWith(1))
    })

    it('does not throw when load fails (silent failure)', async () => {
      mockService.getAll.mockRejectedValueOnce(new Error('Network error'))
      const { result } = renderHook(() => useSolicitudes())
      await waitFor(() => expect(result.current.visible).toHaveLength(0))
      // No toast shown — silent by design
      expect(mockShowToast).not.toHaveBeenCalled()
    })
  })

  describe('filter', () => {
    it('shows all items when filter changes from pending to all', async () => {
      const { result } = renderHook(() => useSolicitudes())
      await waitFor(() => expect(result.current.visible).toHaveLength(1))

      act(() => { result.current.handlers.setFilter('all') })
      expect(result.current.visible).toHaveLength(2)
    })
  })

  describe('handle() — reject', () => {
    it('calls process with rejected and shows toast', async () => {
      mockService.process.mockResolvedValueOnce({ data: null, message: 'Rechazado' })
      const { result } = renderHook(() => useSolicitudes())
      await waitFor(() => expect(result.current.visible).toHaveLength(1))

      await act(() => result.current.handlers.reject('sol1'))

      expect(mockService.process).toHaveBeenCalledWith('sol1', 'rejected')
      expect(mockShowToast).toHaveBeenCalledWith('Rechazado', false)
    })

    it('shows error toast when reject fails', async () => {
      mockService.process.mockRejectedValueOnce(new Error('Reject failed'))
      const { result } = renderHook(() => useSolicitudes())
      await waitFor(() => expect(result.current.visible).toHaveLength(1))

      await act(() => result.current.handlers.reject('sol1'))
      expect(mockShowToast).toHaveBeenCalledWith('Reject failed', false)
    })
  })

  describe('confirmApprove()', () => {
    it('approves and reloads when confirmItem is set', async () => {
      mockService.process.mockResolvedValueOnce({ data: null, message: 'Aprobado' })
      const { result } = renderHook(() => useSolicitudes())
      await waitFor(() => expect(result.current.visible).toHaveLength(1))

      act(() => { result.current.handlers.requestApprove(result.current.visible[0]) })
      await act(() => result.current.handlers.confirmApprove())

      expect(mockService.process).toHaveBeenCalledWith('sol1', 'approved')
      expect(result.current.confirmItem).toBeNull()
    })

    it('does nothing when confirmItem is null', async () => {
      const { result } = renderHook(() => useSolicitudes())
      await waitFor(() => expect(result.current.visible).toHaveLength(1))

      await act(() => result.current.handlers.confirmApprove())
      expect(mockService.process).not.toHaveBeenCalled()
    })
  })
})
