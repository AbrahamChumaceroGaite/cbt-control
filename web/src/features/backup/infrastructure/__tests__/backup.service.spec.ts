import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    BACKUP: {
      DOWNLOAD: '/api/backup',
      RESTORE:  '/api/backup/restore',
    },
  },
}))

import { api } from '@/lib/api'
import { backupService } from '../backup.service'

const mockApi = vi.mocked(api)

// backup.download uses native fetch, not api() — mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('backupService', () => {
  describe('download()', () => {
    it('calls fetch with the correct URL including sections query param', async () => {
      const fakeResponse = new Response('{}', { status: 200 })
      mockFetch.mockResolvedValue(fakeResponse)

      const result = await backupService.download(['courses', 'actions'])

      expect(mockFetch).toHaveBeenCalledWith('/api/backup?sections=courses,actions')
      expect(result).toBe(fakeResponse)
    })

    it('passes multiple sections joined by comma', async () => {
      mockFetch.mockResolvedValue(new Response('{}'))
      await backupService.download(['courses', 'rewards', 'coinLogs'])
      expect(mockFetch).toHaveBeenCalledWith('/api/backup?sections=courses,rewards,coinLogs')
    })
  })

  describe('restore()', () => {
    it('calls POST /api/backup/restore with the data and returns result', async () => {
      const fakeResult = { detected: ['courses'], details: {} }
      mockApi.mockResolvedValue({ data: fakeResult, message: 'OK' })
      const body = { courses: [{ id: 'c1' }] }

      const result = await backupService.restore(body)

      expect(mockApi).toHaveBeenCalledWith('/api/backup/restore', expect.objectContaining({
        method: 'POST',
        body:   JSON.stringify(body),
      }))
      expect(result).toEqual(fakeResult)
    })
  })
})
