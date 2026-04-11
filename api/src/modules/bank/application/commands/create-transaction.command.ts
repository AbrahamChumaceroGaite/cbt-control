import { CreateTransactionDto } from './create-transaction.dto'

export class CreateTransactionCommand {
  constructor(
    public readonly fromStudentId: string,
    public readonly dto: CreateTransactionDto,
  ) {}
}
