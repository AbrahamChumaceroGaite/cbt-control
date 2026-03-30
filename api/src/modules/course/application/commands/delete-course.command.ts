import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { CourseRepository }               from '../../domain/course.repository'

export class DeleteCourseCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteCourseCommand)
export class DeleteCourseHandler implements ICommandHandler<DeleteCourseCommand, void> {
  constructor(private readonly repo: CourseRepository) {}

  async execute({ id }: DeleteCourseCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
