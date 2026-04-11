import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTransacciones } from '../application/useTransacciones'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/transacciones.service', () => ({
  transaccionesService: {
    getAll:   vi.fn(),
    process:  vi.fn(),
  },
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))

vi.mock('@/hooks/useSocketEvent', () => ({
  useSocketEvent: vi.fn(),
}))

vi.mock('@/ws/events', () => ({
  WS: { TRANSACTION_NEW: 'transaction:new' },
}))

vi.mock('@/config/status', () => ({
  TRANSACTION_STATUS: { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' },
}))

import { transaccionesService } from '../infrastructure/transacciones.service'
const mockService   = vi.mocked(transaccionesService)
const mockShowToast = vi.fn()

const fakePending  = { id: 'tx1', status: 'pending',  amount: 50, tax: 1,
  fromStudent: { id: 's1', name: 'Ana',  courseName: 'Math' },
  toStudent:   { id: 's2', name: 'Pedro', courseName: 'Math' },
  notes: '', adminNotes: '', createdAt: '' }
const fakeApproved = { id: 'tx2', status: 'approved', amount: 30, tax: 1,
  fromStudent: { id: 's3', name: 'Luis', courseName: 'Math' },
  toStudent:   { id: 's1', name: 'Ana',  courseName: 'Math' },
  notes: '', adminNotes: '', createdAt: '' }

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getAll.mockResolvedValue([fakePending, fakeApproved])
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useTransacciones', () => {
  describe('load()', () => {
    it('loads transactions on mount', async () => {
      const { result } = renderHook(() => useTransacciones())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.txs).toHaveLength(2)
    })

    it('counts pending transactions correctly', async () => {
      const { result } = renderHook(() => useTransacciones())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.pending).toBe(1)
    })
  })

  describe('filter', () => {
    it('shows all transactions when filter is all', async () => {
      const { result } = renderHook(() => useTransacciones())
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.filtered).toHaveLength(2)
    })

    it('shows only pending when filter is pending', async () => {
      const { result } = renderHook(() => useTransacciones())
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.setFilter('pending') })
      expect(result.current.filtered).toHaveLength(1)
      expect(result.current.filtered[0].status).toBe('pending')
    })
  })

  describe('process()', () => {
    it('approves a transaction and updates it in state', async () => {
      mockService.process.mockResolvedValueOnce(undefined as never)
      const { result } = renderHook(() => useTransacciones())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.process('tx1', { status: 'approved', adminNotes: '' }))

      expect(mockService.process).toHaveBeenCalledWith('tx1', { status: 'approved', adminNotes: '' })
      expect(mockShowToast).toHaveBeenCalledWith('Transaction approved', true)
      const updated = result.current.txs.find(t => t.id === 'tx1')
      expect(updated?.status).toBe('approved')
    })

    it('rejects a transaction and shows rejection toast', async () => {
      mockService.process.mockResolvedValueOnce(undefined as never)
      const { result } = renderHook(() => useTransacciones())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.process('tx1', { status: 'rejected', adminNotes: 'Invalid' }))

      expect(mockShowToast).toHaveBeenCalledWith('Transaction rejected', false)
    })

    it('shows error toast when process fails', async () => {
      mockService.process.mockRejectedValueOnce(new Error('Process failed'))
      const { result } = renderHook(() => useTransacciones())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(() => result.current.process('tx1', { status: 'approved', adminNotes: '' }))
      expect(mockShowToast).toHaveBeenCalledWith('Process failed', false)
    })
  })
})
