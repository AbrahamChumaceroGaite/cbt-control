import { AppException } from '../../../common/exceptions/app.exception'
import { ErrorCode }    from '@control-aula/shared'
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
      throw new AppException(ErrorCode.COURSE_NAME_TOO_SHORT)
    if (!this.level || this.level.trim().length === 0)
      throw new AppException(ErrorCode.COURSE_LEVEL_REQUIRED)
    if (!this.parallel || this.parallel.trim().length === 0)
      throw new AppException(ErrorCode.COURSE_PARALLEL_REQUIRED)
  }
}
