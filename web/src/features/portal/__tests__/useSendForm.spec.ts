import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSendForm } from '../application/useSendForm'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('../infrastructure/portal.service', () => ({
  portalService: {
    getCourses:         vi.fn(),
    searchStudents:     vi.fn(),
    createTransaction:  vi.fn(),
  },
}))

vi.mock('@/config/ui', () => ({
  BANK_TAX:    1,
  TOAST_MS:    3000,
  DEBOUNCE_MS: 300,
}))

import { portalService } from '../infrastructure/portal.service'
const mockService = vi.mocked(portalService)

const fakeCourse    = { id: 'c1', name: 'Matemáticas' }
const fakeRecipient = { id: 's2', name: 'Pedro', courseName: 'Matemáticas' }
const fakeTx        = { id: 'tx1', amount: 5, tax: 1, status: 'pending',
  fromStudent: { id: 's1', name: 'Ana', courseName: 'Math' },
  toStudent:   { id: 's2', name: 'Pedro', courseName: 'Math' },
  notes: '', adminNotes: '', createdAt: '' }

beforeEach(() => {
  vi.clearAllMocks()
  mockService.getCourses.mockResolvedValue([fakeCourse])
  mockService.searchStudents.mockResolvedValue([fakeRecipient])
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useSendForm', () => {
  const defaultOpts = { myCoins: 100, remaining: 3, onSent: vi.fn() }

  describe('initial state', () => {
    it('loads courses on mount', async () => {
      const { result } = renderHook(() => useSendForm(defaultOpts))
      await waitFor(() => expect(result.current.courses).toHaveLength(1))
      expect(result.current.courses[0].name).toBe('Matemáticas')
    })

    it('canSend is false when no recipient is selected', async () => {
      const { result } = renderHook(() => useSendForm(defaultOpts))
      await waitFor(() => expect(result.current.courses).toHaveLength(1))
      expect(result.current.canSend).toBe(false)
    })
  })

  describe('computed values', () => {
    it('total equals amount + BANK_TAX', async () => {
      const { result } = renderHook(() => useSendForm(defaultOpts))
      await waitFor(() => expect(result.current.courses).toHaveLength(1))
      act(() => { result.current.setAmount(5) })
      expect(result.current.total).toBe(6) // 5 + 1 tax
    })

    it('canSend is true when recipient is set, amount >= 1, and myCoins covers total', async () => {
      const { result } = renderHook(() => useSendForm(defaultOpts))
      await waitFor(() => expect(result.current.courses).toHaveLength(1))
      act(() => { result.current.setRecipient(fakeRecipient) })
      act(() => { result.current.setAmount(5) })
      expect(result.current.canSend).toBe(true)
    })

    it('canSend is false when myCoins < total', async () => {
      const { result } = renderHook(() => useSendForm({ ...defaultOpts, myCoins: 2 }))
      await waitFor(() => expect(result.current.courses).toHaveLength(1))
      act(() => { result.current.setRecipient(fakeRecipient) })
      act(() => { result.current.setAmount(5) }) // total = 6 > 2 coins
      expect(result.current.canSend).toBe(false)
    })

    it('canSend is false when remaining is 0', async () => {
      const { result } = renderHook(() => useSendForm({ ...defaultOpts, remaining: 0 }))
      await waitFor(() => expect(result.current.courses).toHaveLength(1))
      act(() => { result.current.setRecipient(fakeRecipient) })
      act(() => { result.current.setAmount(1) })
      expect(result.current.canSend).toBe(false)
    })
  })

  describe('send()', () => {
    it('sends transaction and calls onSent with the returned tx', async () => {
      const onSent = vi.fn()
      mockService.createTransaction.mockResolvedValueOnce({ data: fakeTx, message: 'Enviado' })
      const { result } = renderHook(() => useSendForm({ ...defaultOpts, onSent }))
      await waitFor(() => expect(result.current.courses).toHaveLength(1))

      act(() => { result.current.setRecipient(fakeRecipient) })
      act(() => { result.current.setAmount(5) })
      await act(() => result.current.send())

      expect(mockService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ toStudentId: 's2', amount: 5 }),
      )
      expect(result.current.state).toBe('success')
      expect(onSent).toHaveBeenCalledWith(fakeTx)
    })

    it('sets state to error when send fails', async () => {
      mockService.createTransaction.mockRejectedValueOnce(new Error('Send failed'))
      const { result } = renderHook(() => useSendForm(defaultOpts))
      await waitFor(() => expect(result.current.courses).toHaveLength(1))

      act(() => { result.current.setRecipient(fakeRecipient) })
      act(() => { result.current.setAmount(5) })
      await act(() => result.current.send())

      expect(result.current.state).toBe('error')
      expect(result.current.errMsg).toBe('Send failed')
    })

    it('does nothing when canSend is false', async () => {
      const { result } = renderHook(() => useSendForm(defaultOpts))
      await waitFor(() => expect(result.current.courses).toHaveLength(1))
      // No recipient set → canSend = false
      await act(() => result.current.send())
      expect(mockService.createTransaction).not.toHaveBeenCalled()
    })
  })

  describe('clearSearch()', () => {
    it('resets q and results', async () => {
      const { result } = renderHook(() => useSendForm(defaultOpts))
      await waitFor(() => expect(result.current.courses).toHaveLength(1))

      act(() => { result.current.setQ('pedro') })
      act(() => { result.current.clearSearch() })

      expect(result.current.q).toBe('')
      expect(result.current.results).toHaveLength(0)
    })
  })
})
