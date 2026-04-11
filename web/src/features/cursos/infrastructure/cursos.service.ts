import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { CourseResponse, CourseDetail, CourseInput } from '@control-aula/shared'

export const cursosService = {
  getAll: () =>
    api<CourseResponse[]>(API_ROUTES.COURSES.BASE).then(r => r.data),

  get: (id: string) =>
    api<CourseDetail>(API_ROUTES.COURSES.BY_ID(id)).then(r => r.data),

  create: (body: CourseInput) =>
    api<CourseResponse>(API_ROUTES.COURSES.BASE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  update: (id: string, body: CourseInput) =>
    api<CourseResponse>(API_ROUTES.COURSES.BY_ID(id), {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  delete: (id: string) =>
    api<null>(API_ROUTES.COURSES.BY_ID(id), { method: 'DELETE' }),
}
