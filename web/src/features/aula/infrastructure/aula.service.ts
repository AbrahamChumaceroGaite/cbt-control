import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type {
  CourseResponse,
  CourseDetail,
  StudentResponse,
  ActionResponse,
  RewardResponse,
  CoinLogResponse,
  AwardCoinInput,
} from '@control-aula/shared'

export const aulaService = {
  getCourses: () =>
    api<CourseResponse[]>(API_ROUTES.COURSES.BASE).then(r => r.data),

  getCourseDetail: (id: string) =>
    api<CourseDetail>(API_ROUTES.COURSES.BY_ID(id)).then(r => r.data),

  getStudentsByCourse: (courseId: string) =>
    api<StudentResponse[]>(API_ROUTES.STUDENTS.BY_COURSE(courseId)).then(r => r.data),

  getActions: () =>
    api<ActionResponse[]>(API_ROUTES.ACTIONS.BASE).then(r => r.data),

  getRewards: () =>
    api<RewardResponse[]>(API_ROUTES.REWARDS.BASE).then(r => r.data),

  award: (body: AwardCoinInput) =>
    api<CoinLogResponse>(API_ROUTES.POINTS.AWARD, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),
}
