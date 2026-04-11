import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/api', () => ({ api: vi.fn() }))
vi.mock('@/config/routes', () => ({
  API_ROUTES: {
    COURSES:  { BASE: '/api/cursos', BY_ID: (id: string) => `/api/cursos/${id}` },
    STUDENTS: { BY_COURSE: (id: string) => `/api/estudiantes?courseId=${id}` },
    ACTIONS:  { BASE: '/api/acciones' },
    REWARDS:  { BASE: '/api/recompensas' },
    POINTS:   { AWARD: '/api/puntos' },
  },
}))

import { api } from '@/lib/api'
import { aulaService } from '../aula.service'

const mockApi = vi.mocked(api)

beforeEach(() => vi.clearAllMocks())

describe('aulaService', () => {
  describe('getCourses()', () => {
    it('calls GET /api/cursos and returns data', async () => {
      mockApi.mockResolvedValue({ data: [{ id: 'c1', name: '3ro A' }], message: 'OK' })
      const result = await aulaService.getCourses()
      expect(mockApi).toHaveBeenCalledWith('/api/cursos')
      expect(result).toEqual([{ id: 'c1', name: '3ro A' }])
    })
  })

  describe('getCourseDetail()', () => {
    it('calls GET /api/cursos/:id', async () => {
      mockApi.mockResolvedValue({ data: { id: 'c1' }, message: 'OK' })
      await aulaService.getCourseDetail('c1')
      expect(mockApi).toHaveBeenCalledWith('/api/cursos/c1')
    })
  })

  describe('getStudentsByCourse()', () => {
    it('calls GET /api/estudiantes?courseId=:id', async () => {
      mockApi.mockResolvedValue({ data: [], message: 'OK' })
      await aulaService.getStudentsByCourse('c1')
      expect(mockApi).toHaveBeenCalledWith('/api/estudiantes?courseId=c1')
    })
  })

  describe('getActions()', () => {
    it('calls GET /api/acciones', async () => {
      mockApi.mockResolvedValue({ data: [], message: 'OK' })
      await aulaService.getActions()
      expect(mockApi).toHaveBeenCalledWith('/api/acciones')
    })
  })

  describe('getRewards()', () => {
    it('calls GET /api/recompensas', async () => {
      mockApi.mockResolvedValue({ data: [], message: 'OK' })
      await aulaService.getRewards()
      expect(mockApi).toHaveBeenCalledWith('/api/recompensas')
    })
  })

  describe('award()', () => {
    it('calls POST /api/puntos with the body and returns full response', async () => {
      const body = { courseId: 'c1', studentId: 's1', actionId: 'a1', coins: 10, reason: 'Test' }
      const fakeResponse = { data: { id: 'log1', coins: 10 }, message: 'Awarded' }
      mockApi.mockResolvedValue(fakeResponse)

      const result = await aulaService.award(body as never)

      expect(mockApi).toHaveBeenCalledWith('/api/puntos', expect.objectContaining({
        method: 'POST',
        body:   JSON.stringify(body),
      }))
      expect(result).toEqual(fakeResponse)
    })
  })
})
