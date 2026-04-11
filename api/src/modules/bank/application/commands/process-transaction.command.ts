import { ProcessTransactionDto } from './process-transaction.dto'

export class ProcessTransactionCommand {
  constructor(
    public readonly id: string,
    public readonly dto: ProcessTransactionDto,
  ) {}
}
