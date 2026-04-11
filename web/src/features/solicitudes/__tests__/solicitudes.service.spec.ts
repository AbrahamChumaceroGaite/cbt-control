import { describe, it, expect, vi, beforeEach } from 'vitest'
import { solicitudesService } from '../infrastructure/solicitudes.service'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    SOLICITUDES: {
      BASE:   '/api/solicitudes',
      BY_ID:  (id: string) => `/api/solicitudes/${id}`,
    },
  },
}))

import { api } from '@/lib/api'
const mockApi = vi.mocked(api)

beforeEach(() => { vi.clearAllMocks() })

describe('solicitudesService', () => {
  it('getAll calls GET /api/solicitudes', async () => {
    mockApi.mockResolvedValueOnce({ data: [], message: '' } as never)
    await solicitudesService.getAll()
    expect(mockApi).toHaveBeenCalledWith('/api/solicitudes')
  })

  it('process calls PATCH /api/solicitudes/:id with status approved', async () => {
    mockApi.mockResolvedValueOnce({ data: null, message: 'Aprobado' } as never)
    await solicitudesService.process('sol1', 'approved')
    expect(mockApi).toHaveBeenCalledWith('/api/solicitudes/sol1', expect.objectContaining({
      method: 'PATCH',
      body:   JSON.stringify({ status: 'approved' }),
    }))
  })

  it('process calls PATCH /api/solicitudes/:id with status rejected', async () => {
    mockApi.mockResolvedValueOnce({ data: null, message: 'Rechazado' } as never)
    await solicitudesService.process('sol1', 'rejected')
    expect(mockApi).toHaveBeenCalledWith('/api/solicitudes/sol1', expect.objectContaining({
      method: 'PATCH',
      body:   JSON.stringify({ status: 'rejected' }),
    }))
  })

  it('delete calls DELETE /api/solicitudes/:id', async () => {
    mockApi.mockResolvedValueOnce({ data: null, message: 'Eliminado' } as never)
    await solicitudesService.delete('sol1')
    expect(mockApi).toHaveBeenCalledWith('/api/solicitudes/sol1', { method: 'DELETE' })
  })
})
