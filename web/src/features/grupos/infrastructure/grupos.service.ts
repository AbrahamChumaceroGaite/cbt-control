import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { GroupResponse, GroupInput, CourseResponse, StudentResponse } from '@control-aula/shared'

export const gruposService = {
  getByCourse: (courseId: string) =>
    api<GroupResponse[]>(`${API_ROUTES.GROUPS.BASE}?courseId=${courseId}`).then(r => r.data),

  create: (body: GroupInput & { courseId: string }) =>
    api<GroupResponse>(API_ROUTES.GROUPS.BASE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  update: (id: string, body: GroupInput) =>
    api<GroupResponse>(API_ROUTES.GROUPS.BY_ID(id), {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  delete: (id: string) =>
    api<null>(API_ROUTES.GROUPS.BY_ID(id), { method: 'DELETE' }),

  // Context data — read-only lookups needed by this feature
  getAllCourses: () =>
    api<CourseResponse[]>(API_ROUTES.COURSES.BASE).then(r => r.data),

  getStudentsByCourse: (courseId: string) =>
    api<StudentResponse[]>(API_ROUTES.STUDENTS.BY_COURSE(courseId)).then(r => r.data),
}
