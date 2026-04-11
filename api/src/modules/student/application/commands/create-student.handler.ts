import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import type { StudentResponse }  from '@control-aula/shared'
import { StudentRepository }     from '../../domain/student.repository'
import { StudentMapper }         from '../student.mapper'
import { CreateStudentCommand }  from './create-student.command'

@CommandHandler(CreateStudentCommand)
export class CreateStudentHandler implements ICommandHandler<CreateStudentCommand, StudentResponse> {
  constructor(private readonly repo: StudentRepository) {}

  async execute({ dto }: CreateStudentCommand): Promise<StudentResponse> {
    const student = await this.repo.create(dto)
    return StudentMapper.toResponse(student)
  }
}
