import { describe, it, expect, vi, beforeEach } from 'vitest'
import { estudiantesService } from '../infrastructure/estudiantes.service'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    STUDENTS: {
      BASE:       '/api/estudiantes',
      BY_ID:      (id: string) => `/api/estudiantes/${id}`,
      BY_COURSE:  (id: string) => `/api/estudiantes?courseId=${id}`,
      IMPORT:     '/api/estudiantes/import',
    },
    COURSES: { BASE: '/api/cursos' },
  },
}))

import { api } from '@/lib/api'
const mockApi = vi.mocked(api)

beforeEach(() => { vi.clearAllMocks() })

const fakeStudent = { id: 's1', name: 'Ana García', code: 'A001', email: 'ana@school.edu', coins: 120, courseId: 'c1' }

describe('estudiantesService', () => {
  it('getByCourse calls GET /api/estudiantes?courseId=c1', async () => {
    mockApi.mockResolvedValueOnce({ data: [fakeStudent], message: '' } as never)
    await estudiantesService.getByCourse('c1')
    expect(mockApi).toHaveBeenCalledWith('/api/estudiantes?courseId=c1')
  })

  it('create calls POST /api/estudiantes with body', async () => {
    mockApi.mockResolvedValueOnce({ data: fakeStudent, message: 'Creado' } as never)
    const body = { name: 'Pedro', code: 'B002', email: 'pedro@school.edu', courseId: 'c1' }
    await estudiantesService.create(body)
    expect(mockApi).toHaveBeenCalledWith('/api/estudiantes', expect.objectContaining({
      method: 'POST',
      body:   JSON.stringify(body),
    }))
  })

  it('update calls PUT /api/estudiantes/:id with body', async () => {
    mockApi.mockResolvedValueOnce({ data: fakeStudent, message: 'Actualizado' } as never)
    const body = { name: 'Ana', code: 'A001', email: 'ana@school.edu', coins: 120 }
    await estudiantesService.update('s1', body)
    expect(mockApi).toHaveBeenCalledWith('/api/estudiantes/s1', expect.objectContaining({
      method: 'PUT',
      body:   JSON.stringify(body),
    }))
  })

  it('delete calls DELETE /api/estudiantes/:id', async () => {
    mockApi.mockResolvedValueOnce({ data: null, message: 'Eliminado' } as never)
    await estudiantesService.delete('s1')
    expect(mockApi).toHaveBeenCalledWith('/api/estudiantes/s1', { method: 'DELETE' })
  })

  it('import calls POST /api/estudiantes/import with courseId and rows', async () => {
    mockApi.mockResolvedValueOnce({ data: { count: 5 }, message: '5 importados' } as never)
    const rows = [{ name: 'Ana', code: 'A001', email: 'ana@school.edu' }]
    await estudiantesService.import('c1', rows)
    expect(mockApi).toHaveBeenCalledWith('/api/estudiantes/import', expect.objectContaining({
      method: 'POST',
      body:   JSON.stringify({ courseId: 'c1', students: rows }),
    }))
  })

  it('getAllCourses calls GET /api/cursos', async () => {
    mockApi.mockResolvedValueOnce({ data: [], message: '' } as never)
    await estudiantesService.getAllCourses()
    expect(mockApi).toHaveBeenCalledWith('/api/cursos')
  })
})
