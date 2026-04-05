import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { BankRepository } from '../../domain/bank.repository'
import { BankMapper } from '../bank.mapper'
import type { CoinTransactionResponse } from '@control-aula/shared'

export class GetMyTransactionsQuery {
  constructor(public readonly studentId: string) {}
}

@QueryHandler(GetMyTransactionsQuery)
export class GetMyTransactionsHandler implements IQueryHandler<GetMyTransactionsQuery, CoinTransactionResponse[]> {
  constructor(private readonly repo: BankRepository) {}

  async execute({ studentId }: GetMyTransactionsQuery): Promise<CoinTransactionResponse[]> {
    const items = await this.repo.findByStudent(studentId)
    return items.map(BankMapper.toResponse)
  }
}
