import { apiFetch } from '@/lib/api'
import type { CourseResponse, CourseDetail, CourseInput } from '@control-aula/shared'

export type { CourseDetail }

export const coursesService = {
  getAll: () =>
    apiFetch<CourseResponse[]>('/api/cursos'),

  get: (id: string) =>
    apiFetch<CourseDetail>(`/api/cursos/${id}`),

  create: (body: CourseInput) =>
    apiFetch<CourseResponse>('/api/cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  update: (id: string, body: CourseInput) =>
    apiFetch<CourseResponse>(`/api/cursos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<null>(`/api/cursos/${id}`, { method: 'DELETE' }),
}
