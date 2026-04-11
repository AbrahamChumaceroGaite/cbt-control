import { describe, it, expect, vi, beforeEach } from 'vitest'
import { gruposService } from '../infrastructure/grupos.service'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    GROUPS: {
      BASE:   '/api/grupos',
      BY_ID:  (id: string) => `/api/grupos/${id}`,
    },
    COURSES:  { BASE: '/api/cursos' },
    STUDENTS: { BY_COURSE: (id: string) => `/api/estudiantes?courseId=${id}` },
  },
}))

import { api } from '@/lib/api'
const mockApi = vi.mocked(api)

beforeEach(() => { vi.clearAllMocks() })

const fakeGroup = { id: 'g1', name: 'Equipo A', courseId: 'c1', members: [] }

describe('gruposService', () => {
  it('getByCourse calls GET with courseId query param', async () => {
    mockApi.mockResolvedValueOnce({ data: [fakeGroup], message: '' } as never)
    await gruposService.getByCourse('c1')
    expect(mockApi).toHaveBeenCalledWith('/api/grupos?courseId=c1')
  })

  it('create calls POST /api/grupos with body', async () => {
    mockApi.mockResolvedValueOnce({ data: fakeGroup, message: 'Creado' } as never)
    const body = { name: 'Equipo B', studentIds: ['s1'], courseId: 'c1' }
    await gruposService.create(body)
    expect(mockApi).toHaveBeenCalledWith('/api/grupos', expect.objectContaining({
      method: 'POST',
      body:   JSON.stringify(body),
    }))
  })

  it('update calls PUT /api/grupos/:id with body', async () => {
    mockApi.mockResolvedValueOnce({ data: fakeGroup, message: 'Actualizado' } as never)
    const body = { name: 'Equipo A Mod', studentIds: ['s1', 's2'] }
    await gruposService.update('g1', body)
    expect(mockApi).toHaveBeenCalledWith('/api/grupos/g1', expect.objectContaining({
      method: 'PUT',
      body:   JSON.stringify(body),
    }))
  })

  it('delete calls DELETE /api/grupos/:id', async () => {
    mockApi.mockResolvedValueOnce({ data: null, message: 'Eliminado' } as never)
    await gruposService.delete('g1')
    expect(mockApi).toHaveBeenCalledWith('/api/grupos/g1', { method: 'DELETE' })
  })

  it('getAllCourses calls GET /api/cursos', async () => {
    mockApi.mockResolvedValueOnce({ data: [], message: '' } as never)
    await gruposService.getAllCourses()
    expect(mockApi).toHaveBeenCalledWith('/api/cursos')
  })

  it('getStudentsByCourse calls GET students by courseId', async () => {
    mockApi.mockResolvedValueOnce({ data: [], message: '' } as never)
    await gruposService.getStudentsByCourse('c1')
    expect(mockApi).toHaveBeenCalledWith('/api/estudiantes?courseId=c1')
  })
})
