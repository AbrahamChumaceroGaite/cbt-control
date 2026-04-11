import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { CourseResponse }   from '@control-aula/shared'
import { CourseRepository }      from '../../domain/course.repository'
import { CourseMapper }          from '../course.mapper'
import { UpdateCourseCommand }   from './update-course.command'

@CommandHandler(UpdateCourseCommand)
export class UpdateCourseHandler implements ICommandHandler<UpdateCourseCommand, CourseResponse> {
  constructor(private readonly repo: CourseRepository) {}

  async execute({ id, dto }: UpdateCourseCommand): Promise<CourseResponse> {
    const course = await this.repo.update(id, dto)
    return CourseMapper.toResponse(course)
  }
}
