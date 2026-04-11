import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { StudentRepository }      from '../../domain/student.repository'
import { ImportStudentsCommand }  from './import-students.command'

@CommandHandler(ImportStudentsCommand)
export class ImportStudentsHandler implements ICommandHandler<ImportStudentsCommand, { count: number }> {
  constructor(private readonly repo: StudentRepository) {}

  async execute({ dto }: ImportStudentsCommand): Promise<{ count: number }> {
    const count = await this.repo.createMany(dto.courseId, dto.students)
    return { count }
  }
}
