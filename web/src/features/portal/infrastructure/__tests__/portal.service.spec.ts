import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    PORTAL: {
      ME:          '/api/portal/me',
      REWARDS:     '/api/portal/recompensas',
      SOLICITUDES: '/api/portal/solicitudes',
      SOL_BY_ID:   (id: string) => `/api/portal/solicitudes/${id}`,
      PROFILE:     '/api/portal/profile',
    },
    BANK: {
      STATUS:       '/api/bank/status',
      TRANSACTIONS: '/api/bank/transactions',
      COURSES:      '/api/bank/courses',
      SEARCH:       '/api/bank/search',
    },
  },
}))

import { api } from '@/lib/api'
import { portalService } from '../portal.service'

const mockApi = vi.mocked(api)

beforeEach(() => vi.clearAllMocks())

describe('portalService', () => {
  describe('getMe()', () => {
    it('calls GET /api/portal/me and returns data', async () => {
      mockApi.mockResolvedValue({ data: { id: 's1' }, message: 'OK' })
      const result = await portalService.getMe()
      expect(mockApi).toHaveBeenCalledWith('/api/portal/me')
      expect(result).toEqual({ id: 's1' })
    })
  })

  describe('getRewards()', () => {
    it('calls GET /api/portal/recompensas', async () => {
      mockApi.mockResolvedValue({ data: [], message: 'OK' })
      await portalService.getRewards()
      expect(mockApi).toHaveBeenCalledWith('/api/portal/recompensas')
    })
  })

  describe('requestReward()', () => {
    it('calls POST /api/portal/solicitudes with rewardId', async () => {
      mockApi.mockResolvedValue({ data: null, message: 'Solicitada' })
      await portalService.requestReward('r1')
      expect(mockApi).toHaveBeenCalledWith('/api/portal/solicitudes', expect.objectContaining({
        method: 'POST',
        body:   JSON.stringify({ rewardId: 'r1' }),
      }))
    })
  })

  describe('updateProfile()', () => {
    it('calls PUT /api/portal/profile with the data', async () => {
      mockApi.mockResolvedValue({ data: null, message: 'OK' })
      await portalService.updateProfile({ avatarUrl: 'https://cdn/a.jpg' })
      expect(mockApi).toHaveBeenCalledWith('/api/portal/profile', expect.objectContaining({
        method: 'PUT',
        body:   JSON.stringify({ avatarUrl: 'https://cdn/a.jpg' }),
      }))
    })
  })

  describe('getBankStatus()', () => {
    it('calls GET /api/bank/status', async () => {
      mockApi.mockResolvedValue({ data: { used: 1, limit: 3, remaining: 2 }, message: 'OK' })
      await portalService.getBankStatus()
      expect(mockApi).toHaveBeenCalledWith('/api/bank/status')
    })
  })

  describe('getMyTransactions()', () => {
    it('calls GET /api/bank/transactions', async () => {
      mockApi.mockResolvedValue({ data: [], message: 'OK' })
      await portalService.getMyTransactions()
      expect(mockApi).toHaveBeenCalledWith('/api/bank/transactions')
    })
  })

  describe('cancelRedemption()', () => {
    it('calls DELETE /api/portal/solicitudes/:id', async () => {
      mockApi.mockResolvedValue({ data: null, message: 'OK' })
      await portalService.cancelRedemption('req1')
      expect(mockApi).toHaveBeenCalledWith('/api/portal/solicitudes/req1', expect.objectContaining({ method: 'DELETE' }))
    })
  })

  describe('getCourses()', () => {
    it('calls GET /api/bank/courses', async () => {
      mockApi.mockResolvedValue({ data: [], message: 'OK' })
      await portalService.getCourses()
      expect(mockApi).toHaveBeenCalledWith('/api/bank/courses')
    })
  })

  describe('searchStudents()', () => {
    it('calls GET /api/bank/search?q=ana with query param', async () => {
      mockApi.mockResolvedValue({ data: [], message: 'OK' })
      await portalService.searchStudents('ana')
      expect(mockApi).toHaveBeenCalledWith('/api/bank/search?q=ana')
    })

    it('appends courseId when provided', async () => {
      mockApi.mockResolvedValue({ data: [], message: 'OK' })
      await portalService.searchStudents('ana', 'c1')
      expect(mockApi).toHaveBeenCalledWith('/api/bank/search?q=ana&courseId=c1')
    })
  })

  describe('createTransaction()', () => {
    it('calls POST /api/bank/transactions with the dto', async () => {
      const dto = { toStudentId: 's2', amount: 10, notes: '' }
      mockApi.mockResolvedValue({ data: { id: 'tx1' }, message: 'OK' })
      await portalService.createTransaction(dto as never)
      expect(mockApi).toHaveBeenCalledWith('/api/bank/transactions', expect.objectContaining({
        method: 'POST',
        body:   JSON.stringify(dto),
      }))
    })
  })
})
