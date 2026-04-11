import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { NotFoundException }           from '@nestjs/common'
import { CourseRepository }            from '../../domain/course.repository'
import type { CourseEntity }           from '../../domain/course.entity'
import { GetCourseByIdQuery }          from './get-course-by-id.query'

@QueryHandler(GetCourseByIdQuery)
export class GetCourseByIdHandler implements IQueryHandler<GetCourseByIdQuery, CourseEntity> {
  constructor(private readonly repo: CourseRepository) {}

  async execute({ id }: GetCourseByIdQuery): Promise<CourseEntity> {
    const course = await this.repo.findById(id)
    if (!course) throw new NotFoundException(`Curso ${id} no encontrado`)
    return course
  }
}
