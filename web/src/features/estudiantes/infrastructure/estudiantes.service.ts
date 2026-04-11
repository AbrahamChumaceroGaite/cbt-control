import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { StudentResponse, StudentInput, CourseResponse } from '@control-aula/shared'
import type { ImportRow } from '../domain/types'

type StudentCreateBody = StudentInput & { courseId: string; name: string }

export const estudiantesService = {
  getByCourse: (courseId: string) =>
    api<StudentResponse[]>(API_ROUTES.STUDENTS.BY_COURSE(courseId)).then(r => r.data),

  create: (body: StudentCreateBody) =>
    api<StudentResponse>(API_ROUTES.STUDENTS.BASE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  update: (id: string, body: StudentInput) =>
    api<StudentResponse>(API_ROUTES.STUDENTS.BY_ID(id), {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  delete: (id: string) =>
    api<null>(API_ROUTES.STUDENTS.BY_ID(id), { method: 'DELETE' }),

  import: (courseId: string, students: ImportRow[]) =>
    api<{ count: number }>(API_ROUTES.STUDENTS.IMPORT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ courseId, students }),
    }),

  // Context data needed by this feature
  getAllCourses: () =>
    api<CourseResponse[]>(API_ROUTES.COURSES.BASE).then(r => r.data),
}
