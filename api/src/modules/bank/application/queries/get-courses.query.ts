import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { BankRepository } from '../../domain/bank.repository'

export class GetCoursesQuery {}

@QueryHandler(GetCoursesQuery)
export class GetCoursesHandler implements IQueryHandler<GetCoursesQuery, { id: string; name: string }[]> {
  constructor(private readonly repo: BankRepository) {}

  execute(): Promise<{ id: string; name: string }[]> {
    return this.repo.getCourses()
  }
}
