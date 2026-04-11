import { describe, it, expect, vi, beforeEach } from 'vitest'
import { recompensasService } from '../infrastructure/recompensas.service'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    REWARDS: {
      BASE:   '/api/recompensas',
      BY_ID:  (id: string) => `/api/recompensas/${id}`,
    },
  },
}))

import { api } from '@/lib/api'
const mockApi = vi.mocked(api)

beforeEach(() => { vi.clearAllMocks() })

const fakeReward = {
  id: 'r1', name: 'Libro de Oro', description: 'Premio', icon: '📖',
  coinsRequired: 200, discount: 0, type: 'individual', isGlobal: false, isActive: true,
}

describe('recompensasService', () => {
  it('getAll calls GET /api/recompensas', async () => {
    mockApi.mockResolvedValueOnce({ data: [fakeReward], message: '' } as never)
    await recompensasService.getAll()
    expect(mockApi).toHaveBeenCalledWith('/api/recompensas')
  })

  it('create calls POST /api/recompensas with body', async () => {
    mockApi.mockResolvedValueOnce({ data: fakeReward, message: 'Creado' } as never)
    const body = { name: 'Trofeo', description: 'Desc', icon: '🏆', coinsRequired: 100, discount: 0, type: 'class' as const, isGlobal: true, isActive: true }
    await recompensasService.create(body)
    expect(mockApi).toHaveBeenCalledWith('/api/recompensas', expect.objectContaining({
      method: 'POST',
      body:   JSON.stringify(body),
    }))
  })

  it('update calls PUT /api/recompensas/:id with body', async () => {
    mockApi.mockResolvedValueOnce({ data: fakeReward, message: 'Actualizado' } as never)
    const body = { name: 'Libro', description: 'Desc', icon: '📖', coinsRequired: 150, discount: 10, type: 'individual' as const, isGlobal: false, isActive: true }
    await recompensasService.update('r1', body)
    expect(mockApi).toHaveBeenCalledWith('/api/recompensas/r1', expect.objectContaining({
      method: 'PUT',
      body:   JSON.stringify(body),
    }))
  })

  it('delete calls DELETE /api/recompensas/:id', async () => {
    mockApi.mockResolvedValueOnce({ data: null, message: 'Eliminado' } as never)
    await recompensasService.delete('r1')
    expect(mockApi).toHaveBeenCalledWith('/api/recompensas/r1', { method: 'DELETE' })
  })
})
