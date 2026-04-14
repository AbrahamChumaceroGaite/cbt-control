import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SessionPayload } from '@control-aula/shared'

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
}))

vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    AUTH: {
      ME:     '/api/auth/me',
      LOGOUT: '/api/auth/logout',
    },
  },
}))

import { api } from '@/lib/api'
import { dashboardService } from '../dashboard.service'

const mockApi = vi.mocked(api)

const fakeProfile: SessionPayload = {
  userId:   'u1',
  role:     'admin',
  code:     'ADM001',
  fullName: 'Admin User',
}

beforeEach(() => vi.clearAllMocks())

describe('dashboardService', () => {
  describe('getProfile()', () => {
    it('calls api with AUTH.ME endpoint and returns data', async () => {
      mockApi.mockResolvedValueOnce({ data: fakeProfile, message: 'OK' })

      const result = await dashboardService.getProfile()

      expect(mockApi).toHaveBeenCalledWith('/api/auth/me')
      expect(result).toEqual(fakeProfile)
    })
  })

  describe('logout()', () => {
    it('calls api with AUTH.LOGOUT endpoint using POST method', async () => {
      mockApi.mockResolvedValueOnce({ data: null, message: 'OK' })

      await dashboardService.logout()

      expect(mockApi).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' })
    })
  })
})
