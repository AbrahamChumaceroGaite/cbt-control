import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { CourseRepository } from '../../domain/course.repository'
import { CourseMapper }     from '../course.mapper'
import type { CourseResponse } from '@control-aula/shared'

export class GetCoursesQuery {}

@QueryHandler(GetCoursesQuery)
export class GetCoursesHandler implements IQueryHandler<GetCoursesQuery, CourseResponse[]> {
  constructor(private readonly repo: CourseRepository) {}

  async execute(): Promise<CourseResponse[]> {
    const courses = await this.repo.findAll()
    return courses.map(CourseMapper.toResponse)
  }
}
