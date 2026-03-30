import { apiFetch } from '@/lib/api'
import type { StudentResponse, StudentInput } from '@control-aula/shared'

type StudentCreateBody = StudentInput & { courseId: string; name: string }
type ImportRow         = { code: string; name: string; email: string }

export const studentsService = {
  getByCourse: (courseId: string) =>
    apiFetch<StudentResponse[]>(`/api/estudiantes?courseId=${courseId}`),

  create: (body: StudentCreateBody) =>
    apiFetch<StudentResponse>('/api/estudiantes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  update: (id: string, body: StudentInput) =>
    apiFetch<StudentResponse>(`/api/estudiantes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<null>(`/api/estudiantes/${id}`, { method: 'DELETE' }),

  import: (courseId: string, students: ImportRow[]) =>
    apiFetch<{ count: number }>('/api/estudiantes/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, students }),
    }),
}
