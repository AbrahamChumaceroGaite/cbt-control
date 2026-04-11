import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { BankRepository }             from '../../domain/bank.repository'
import type { StudentSearchResult }   from '@control-aula/shared'
import { SearchStudentsQuery }        from './search-students.query'

@QueryHandler(SearchStudentsQuery)
export class SearchStudentsHandler implements IQueryHandler<SearchStudentsQuery, StudentSearchResult[]> {
  constructor(private readonly repo: BankRepository) {}

  execute({ q, excludeId, courseId }: SearchStudentsQuery): Promise<StudentSearchResult[]> {
    return this.repo.searchStudents(q, excludeId, courseId)
  }
}
