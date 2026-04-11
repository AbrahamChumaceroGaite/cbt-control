import type { UpdateStudentDto } from './update-student.dto'

export class UpdateStudentCommand {
  constructor(
    public readonly id:  string,
    public readonly dto: UpdateStudentDto,
  ) {}
}
