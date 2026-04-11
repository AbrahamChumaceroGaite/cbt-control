import { IQueryHandler, QueryHandler }    from '@nestjs/cqrs'
import { BankRepository }                from '../../domain/bank.repository'
import { BankMapper }                    from '../bank.mapper'
import type { CoinTransactionResponse }  from '@control-aula/shared'
import { GetAllTransactionsQuery }       from './get-all-transactions.query'

@QueryHandler(GetAllTransactionsQuery)
export class GetAllTransactionsHandler implements IQueryHandler<GetAllTransactionsQuery, CoinTransactionResponse[]> {
  constructor(private readonly repo: BankRepository) {}

  async execute({ status, studentId }: GetAllTransactionsQuery): Promise<CoinTransactionResponse[]> {
    const items = await this.repo.findAll(status, studentId)
    return items.map(BankMapper.toResponse)
  }
}
