import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { BankRepository } from '../../domain/bank.repository'
import { BankMapper } from '../bank.mapper'
import type { CoinTransactionResponse } from '@control-aula/shared'

export class GetAllTransactionsQuery {
  constructor(public readonly status?: string) {}
}

@QueryHandler(GetAllTransactionsQuery)
export class GetAllTransactionsHandler implements IQueryHandler<GetAllTransactionsQuery, CoinTransactionResponse[]> {
  constructor(private readonly repo: BankRepository) {}

  async execute({ status }: GetAllTransactionsQuery): Promise<CoinTransactionResponse[]> {
    const items = await this.repo.findAll(status)
    return items.map(BankMapper.toResponse)
  }
}
