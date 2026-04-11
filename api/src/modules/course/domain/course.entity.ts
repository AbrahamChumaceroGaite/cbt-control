import type { CourseStudentEntity, CourseCoinLogEntity } from './course-detail.types'

export class CourseEntity {
  readonly id:         string
  readonly name:       string
  readonly level:      string
  readonly parallel:   string
  readonly classCoins: number
  readonly createdAt:  Date
  readonly updatedAt:  Date
  readonly _count?:    { students: number }
  readonly students?:  CourseStudentEntity[]
  readonly coinLogs?:  CourseCoinLogEntity[]

  constructor(props: {
    id: string; name: string; level: string; parallel: string; classCoins: number
    createdAt: Date; updatedAt: Date
    _count?: { students: number }
    students?: CourseStudentEntity[]
    coinLogs?: CourseCoinLogEntity[]
  }) {
    this.id         = props.id
    this.name       = props.name
    this.level      = props.level
    this.parallel   = props.parallel
    this.classCoins = props.classCoins
    this.createdAt  = props.createdAt
    this.updatedAt  = props.updatedAt
    this._count     = props._count
    this.students   = props.students
    this.coinLogs   = props.coinLogs
    this.validate()
  }

  private validate(): void {
    if (!this.name || this.name.trim().length < 2)
      throw new Error('El nombre del curso debe tener al menos 2 caracteres')
    if (!this.level || this.level.trim().length === 0)
      throw new Error('El nivel del curso es requerido')
    if (!this.parallel || this.parallel.trim().length === 0)
      throw new Error('El paralelo del curso es requerido')
  }
}
