export class CancelRedemptionCommand {
  constructor(
    public readonly studentId: string,
    public readonly requestId: string,
  ) {}
}
