import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { StudentRepository } from '../../domain/student.repository'

export class DeleteStudentCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteStudentCommand)
export class DeleteStudentHandler implements ICommandHandler<DeleteStudentCommand, void> {
  constructor(private readonly repo: StudentRepository) {}

  async execute({ id }: DeleteStudentCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
