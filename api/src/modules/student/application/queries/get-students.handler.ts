import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import type { StudentResponse } from '@control-aula/shared'
import { StudentRepository }    from '../../domain/student.repository'
import { StudentMapper }        from '../student.mapper'
import { GetStudentsQuery }     from './get-students.query'

@QueryHandler(GetStudentsQuery)
export class GetStudentsHandler implements IQueryHandler<GetStudentsQuery, StudentResponse[]> {
  constructor(private readonly repo: StudentRepository) {}

  async execute({ courseId }: GetStudentsQuery): Promise<StudentResponse[]> {
    const students = await this.repo.findAll(courseId)
    return students.map(StudentMapper.toResponse)
  }
}
