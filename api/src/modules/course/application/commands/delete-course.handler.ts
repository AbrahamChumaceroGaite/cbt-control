import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CourseRepository }    from '../../domain/course.repository'
import { DeleteCourseCommand } from './delete-course.command'

@CommandHandler(DeleteCourseCommand)
export class DeleteCourseHandler implements ICommandHandler<DeleteCourseCommand, void> {
  constructor(private readonly repo: CourseRepository) {}

  async execute({ id }: DeleteCourseCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
