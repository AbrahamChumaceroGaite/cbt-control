export class GetAllTransactionsQuery {
  constructor(
    public readonly status?: string,
    public readonly studentId?: string,
  ) {}
}
