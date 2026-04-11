export interface StudentTramoEntity { tramo: string; awardedAt: Date }

export class StudentEntity {
  readonly id:        string
  readonly courseId:  string
  readonly code:      string
  readonly name:      string
  readonly email:     string | null
  readonly coins:     number
  readonly createdAt: Date
  readonly tramos:    StudentTramoEntity[]
  readonly course?:   { name: string; classCoins?: number }

  constructor(props: {
    id:        string
    courseId:  string
    code:      string
    name:      string
    email:     string | null
    coins:     number
    createdAt: Date
    tramos:    StudentTramoEntity[]
    course?:   { name: string; classCoins?: number }
  }) {
    this.id        = props.id
    this.courseId  = props.courseId
    this.code      = props.code
    this.name      = props.name
    this.email     = props.email
    this.coins     = props.coins
    this.createdAt = props.createdAt
    this.tramos    = props.tramos
    this.course    = props.course
    this.validate()
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0)
      throw new Error('El nombre del estudiante es requerido')
    if (!this.courseId || this.courseId.trim().length === 0)
      throw new Error('El curso del estudiante es requerido')
    if (this.coins < 0)
      throw new Error('Los coins del estudiante no pueden ser negativos')
  }
}
