import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useBankTab } from '../application/useBankTab'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/portal.service', () => ({
  portalService: {
    getBankStatus:      vi.fn(),
    getMyTransactions:  vi.fn(),
  },
}))

vi.mock('@/hooks/useSocketEvent', () => ({
  useSocketEvent: vi.fn(),
}))

vi.mock('@/ws/events', () => ({
  WS: { TRANSACTION_UPDATED: 'tx:updated', COINS_UPDATED: 'coins:updated' },
}))

vi.mock('@/config/ui', () => ({
  BANK_TX_LIMIT: 3,
}))

import { portalService } from '../infrastructure/portal.service'
const mockService = vi.mocked(portalService)

const fakeStatus = { used: 1, limit: 3, remaining: 2 }
const fakeTx     = { id: 'tx1', amount: 10, tax: 1, status: 'pending',
  fromStudent: { id: 's1', name: 'Ana', courseName: 'Math' },
  toStudent:   { id: 's2', name: 'Pedro', courseName: 'Math' },
  notes: '', adminNotes: '', createdAt: '' }

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getBankStatus.mockResolvedValue(fakeStatus)
  mockService.getMyTransactions.mockResolvedValue([fakeTx])
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useBankTab', () => {
  const defaultOpts = { studentId: 's1', studentCoins: 200, onCoinsUpdate: vi.fn() }

  describe('load()', () => {
    it('loads bank status and transactions on mount', async () => {
      const { result } = renderHook(() => useBankTab(defaultOpts))
      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.status.used).toBe(1)
      expect(result.current.txs).toHaveLength(1)
    })
  })

  describe('handleSent()', () => {
    it('prepends the new transaction and decrements remaining', async () => {
      const { result } = renderHook(() => useBankTab(defaultOpts))
      await waitFor(() => expect(result.current.loading).toBe(false))

      const newTx = { ...fakeTx, id: 'tx2', amount: 5, tax: 1 }
      act(() => { result.current.handleSent(newTx) })

      expect(result.current.txs[0].id).toBe('tx2')
      expect(result.current.status.used).toBe(2)
      expect(result.current.status.remaining).toBe(1)
    })

    it('calls onCoinsUpdate with the new balance after deducting amount + tax', async () => {
      const onCoinsUpdate = vi.fn()
      const { result } = renderHook(() => useBankTab({ ...defaultOpts, onCoinsUpdate }))
      await waitFor(() => expect(result.current.loading).toBe(false))

      act(() => { result.current.handleSent({ ...fakeTx, amount: 10, tax: 1 }) })
      // 200 coins - 10 amount - 1 tax = 189
      expect(onCoinsUpdate).toHaveBeenCalledWith(189)
    })
  })
})
