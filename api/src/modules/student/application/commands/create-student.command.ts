import type { CreateStudentDto } from './create-student.dto'

export class CreateStudentCommand {
  constructor(public readonly dto: CreateStudentDto) {}
}
