import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { BankRepository } from '../../domain/bank.repository'
import type { WeeklyBankStatus } from '@control-aula/shared'

const WEEKLY_LIMIT = 3

export class GetWeeklyStatusQuery {
  constructor(public readonly fromStudentId: string) {}
}

@QueryHandler(GetWeeklyStatusQuery)
export class GetWeeklyStatusHandler implements IQueryHandler<GetWeeklyStatusQuery, WeeklyBankStatus> {
  constructor(private readonly repo: BankRepository) {}

  async execute({ fromStudentId }: GetWeeklyStatusQuery): Promise<WeeklyBankStatus> {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
    weekStart.setHours(0, 0, 0, 0)

    const used = await this.repo.countWeekly(fromStudentId, weekStart)
    return { used, limit: WEEKLY_LIMIT, remaining: Math.max(0, WEEKLY_LIMIT - used) }
  }
}
