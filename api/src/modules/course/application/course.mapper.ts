import type { CourseEntity } from '../domain/course.entity'
import type { CourseResponse } from '@control-aula/shared'

export class CourseMapper {
  static toResponse(entity: CourseEntity): CourseResponse {
    return {
      id:           entity.id,
      name:         entity.name,
      level:        entity.level,
      parallel:     entity.parallel,
      classCoins:   entity.classCoins,
      studentCount: entity._count?.students,
    }
  }
}
