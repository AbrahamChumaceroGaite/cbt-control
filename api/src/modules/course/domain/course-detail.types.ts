export interface CourseStudentEntity {
  id:     string
  name:   string
  coins:  number
  code:   string
  email:  string | null
  tramos: { tramo: string; awardedAt: Date }[]
}

export interface CourseCoinLogEntity {
  id:        string
  coins:     number
  reason:    string
  createdAt: Date
  student?:  { name: string } | null
  action?:   { name: string; category: string } | null
}
