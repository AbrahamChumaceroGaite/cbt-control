import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { CourseResponse }   from '@control-aula/shared'
import { CourseRepository }      from '../../domain/course.repository'
import { CourseMapper }          from '../course.mapper'
import { CreateCourseCommand }   from './create-course.command'

@CommandHandler(CreateCourseCommand)
export class CreateCourseHandler implements ICommandHandler<CreateCourseCommand, CourseResponse> {
  constructor(private readonly repo: CourseRepository) {}

  async execute({ dto }: CreateCourseCommand): Promise<CourseResponse> {
    const course = await this.repo.create(dto)
    return CourseMapper.toResponse(course)
  }
}
