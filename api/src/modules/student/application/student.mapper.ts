import type { StudentEntity } from '../domain/student.entity'
import type { StudentResponse } from '@control-aula/shared'

export class StudentMapper {
  static toResponse(entity: StudentEntity): StudentResponse {
    return {
      id:       entity.id,
      courseId: entity.courseId,
      name:     entity.name,
      code:     entity.code,
      email:    entity.email,
      coins:    entity.coins,
      tramos:   entity.tramos.map(t => ({ tramo: t.tramo })),
      course:   entity.course,
    }
  }
}
