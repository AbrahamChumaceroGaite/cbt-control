import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { StudentRepository }    from '../../domain/student.repository'
import { DeleteStudentCommand } from './delete-student.command'

@CommandHandler(DeleteStudentCommand)
export class DeleteStudentHandler implements ICommandHandler<DeleteStudentCommand, void> {
  constructor(private readonly repo: StudentRepository) {}

  async execute({ id }: DeleteStudentCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
