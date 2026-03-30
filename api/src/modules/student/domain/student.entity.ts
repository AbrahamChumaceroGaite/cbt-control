export interface StudentTramoEntity { tramo: string; awardedAt: Date }

export interface StudentEntity {
  id:        string
  courseId:  string
  code:      string
  name:      string
  email:     string | null
  coins:     number
  createdAt: Date
  tramos:    StudentTramoEntity[]
  course?:   { name: string }
}
