import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { StudentRepository } from '../../domain/student.repository'
import { StudentMapper }     from '../student.mapper'
import type { StudentResponse } from '@control-aula/shared'

export class GetStudentsQuery {
  constructor(public readonly courseId?: string) {}
}

@QueryHandler(GetStudentsQuery)
export class GetStudentsHandler implements IQueryHandler<GetStudentsQuery, StudentResponse[]> {
  constructor(private readonly repo: StudentRepository) {}

  async execute({ courseId }: GetStudentsQuery): Promise<StudentResponse[]> {
    const students = await this.repo.findAll(courseId)
    return students.map(StudentMapper.toResponse)
  }
}
