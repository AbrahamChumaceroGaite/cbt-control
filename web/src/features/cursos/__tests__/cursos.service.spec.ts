import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cursosService } from '../infrastructure/cursos.service'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    COURSES: {
      BASE:    '/api/cursos',
      BY_ID:   (id: string) => `/api/cursos/${id}`,
    },
  },
}))

import { api } from '@/lib/api'
const mockApi = vi.mocked(api)

beforeEach(() => { vi.clearAllMocks() })

const fakeCourse = { id: 'c1', name: 'Matemáticas', level: 'Secondary 2', parallel: 'A', classCoins: 150 }

describe('cursosService', () => {
  it('getAll calls GET /api/cursos', async () => {
    mockApi.mockResolvedValueOnce({ data: [fakeCourse], message: '' } as never)
    await cursosService.getAll()
    expect(mockApi).toHaveBeenCalledWith('/api/cursos')
  })

  it('get calls GET /api/cursos/:id', async () => {
    mockApi.mockResolvedValueOnce({ data: fakeCourse, message: '' } as never)
    await cursosService.get('c1')
    expect(mockApi).toHaveBeenCalledWith('/api/cursos/c1')
  })

  it('create calls POST /api/cursos with body', async () => {
    mockApi.mockResolvedValueOnce({ data: fakeCourse, message: 'Creado' } as never)
    const body = { name: 'Física', level: 'Secondary 3', parallel: 'B', classCoins: 100 }
    await cursosService.create(body)
    expect(mockApi).toHaveBeenCalledWith('/api/cursos', expect.objectContaining({
      method: 'POST',
      body:   JSON.stringify(body),
    }))
  })

  it('update calls PUT /api/cursos/:id with body', async () => {
    mockApi.mockResolvedValueOnce({ data: fakeCourse, message: 'Actualizado' } as never)
    const body = { name: 'Química', level: 'Secondary 1', parallel: 'C', classCoins: 200 }
    await cursosService.update('c1', body)
    expect(mockApi).toHaveBeenCalledWith('/api/cursos/c1', expect.objectContaining({
      method: 'PUT',
      body:   JSON.stringify(body),
    }))
  })

  it('delete calls DELETE /api/cursos/:id', async () => {
    mockApi.mockResolvedValueOnce({ data: null, message: 'Eliminado' } as never)
    await cursosService.delete('c1')
    expect(mockApi).toHaveBeenCalledWith('/api/cursos/c1', { method: 'DELETE' })
  })
})
