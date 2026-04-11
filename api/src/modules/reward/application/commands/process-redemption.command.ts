import type { ProcessRedemptionDto } from './process-redemption.dto'

export class ProcessRedemptionCommand {
  constructor(
    public readonly id:  string,
    public readonly dto: ProcessRedemptionDto,
  ) {}
}
