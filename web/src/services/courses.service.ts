import { apiFetch, apiFetchFull } from '@/lib/api'
import type { CourseResponse, CourseDetail, CourseInput } from '@control-aula/shared'

export type { CourseDetail }

export const coursesService = {
  getAll: () =>
    apiFetch<CourseResponse[]>('/api/cursos'),

  get: (id: string) =>
    apiFetch<CourseDetail>(`/api/cursos/${id}`),

  create: (body: CourseInput) =>
    apiFetchFull<CourseResponse>('/api/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  update: (id: string, body: CourseInput) =>
    apiFetchFull<CourseResponse>(`/api/cursos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetchFull<null>(`/api/cursos/${id}`, { method: 'DELETE' }),
}
