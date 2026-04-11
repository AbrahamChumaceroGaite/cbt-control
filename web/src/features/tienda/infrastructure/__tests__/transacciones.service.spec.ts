import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    BANK: {
      ADMIN_TXS:      '/api/bank/admin/transactions',
      ADMIN_TX_BY_ID: (id: string) => `/api/bank/admin/transactions/${id}`,
    },
  },
}))

import { api } from '@/lib/api'
import { transaccionesService } from '../transacciones.service'

const mockApi = vi.mocked(api)

const fakeTx = {
  id: 'tx1', status: 'pending', amount: 50, tax: 1,
  fromStudent: { id: 's1', name: 'Ana',   courseName: 'Math' },
  toStudent:   { id: 's2', name: 'Pedro', courseName: 'Math' },
  notes: '', adminNotes: '', createdAt: '',
}

beforeEach(() => vi.clearAllMocks())

describe('transaccionesService', () => {
  describe('getAll()', () => {
    it('calls GET /api/bank/admin/transactions and returns data', async () => {
      mockApi.mockResolvedValue({ data: [fakeTx], message: 'OK' })

      const result = await transaccionesService.getAll()

      expect(mockApi).toHaveBeenCalledWith('/api/bank/admin/transactions')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('tx1')
    })
  })

  describe('process()', () => {
    it('calls PATCH /api/bank/admin/transactions/:id to approve', async () => {
      mockApi.mockResolvedValue({ data: undefined, message: 'OK' })
      const payload = { status: 'approved' as const, adminNotes: 'Todo correcto' }

      await transaccionesService.process('tx1', payload)

      expect(mockApi).toHaveBeenCalledWith('/api/bank/admin/transactions/tx1', expect.objectContaining({
        method: 'PATCH',
        body:   JSON.stringify(payload),
      }))
    })

    it('calls PATCH /api/bank/admin/transactions/:id to reject', async () => {
      mockApi.mockResolvedValue({ data: undefined, message: 'OK' })
      const payload = { status: 'rejected' as const, adminNotes: 'Inválido' }

      await transaccionesService.process('tx1', payload)

      expect(mockApi).toHaveBeenCalledWith('/api/bank/admin/transactions/tx1', expect.objectContaining({
        method: 'PATCH',
        body:   JSON.stringify(payload),
      }))
    })
  })
})
