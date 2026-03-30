export interface CourseEntity {
  id:         string
  name:       string
  level:      string
  parallel:   string
  classCoins: number
  createdAt:  Date
  updatedAt:  Date
  _count?:    { students: number }
  students?:  import('./course-detail.types').CourseStudentEntity[]
  coinLogs?:  import('./course-detail.types').CourseCoinLogEntity[]
}
