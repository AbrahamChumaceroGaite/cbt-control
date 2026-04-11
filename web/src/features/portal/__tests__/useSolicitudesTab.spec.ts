import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSolicitudesTab } from '../application/useSolicitudesTab'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/portal.service', () => ({
  portalService: {
    cancelRedemption: vi.fn(),
  },
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

import { portalService } from '../infrastructure/portal.service'
const mockService   = vi.mocked(portalService)
const mockShowToast = vi.fn()

beforeEach(() => { vi.clearAllMocks() })

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useSolicitudesTab', () => {
  describe('doCancel()', () => {
    it('cancels a redemption and calls onReload', async () => {
      const onReload = vi.fn()
      mockService.cancelRedemption.mockResolvedValueOnce(undefined as never)
      const { result } = renderHook(() => useSolicitudesTab(onReload))

      await act(() => result.current.doCancel('sol1'))

      expect(mockService.cancelRedemption).toHaveBeenCalledWith('sol1')
      expect(mockShowToast).toHaveBeenCalledWith('Solicitud cancelada')
      expect(onReload).toHaveBeenCalledTimes(1)
    })

    it('clears cancelling state after success', async () => {
      mockService.cancelRedemption.mockResolvedValueOnce(undefined as never)
      const { result } = renderHook(() => useSolicitudesTab(vi.fn()))

      await act(() => result.current.doCancel('sol1'))
      expect(result.current.cancelling).toBeNull()
    })

    it('shows error toast when cancelRedemption fails', async () => {
      mockService.cancelRedemption.mockRejectedValueOnce(new Error('Cancel failed'))
      const { result } = renderHook(() => useSolicitudesTab(vi.fn()))

      await act(() => result.current.doCancel('sol1'))
      expect(mockShowToast).toHaveBeenCalledWith('Cancel failed', false)
      expect(result.current.cancelling).toBeNull()
    })
  })
})
