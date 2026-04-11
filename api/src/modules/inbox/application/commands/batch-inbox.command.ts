import { BatchInboxDto } from './batch-inbox.dto'

export class BatchInboxCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: BatchInboxDto,
  ) {}
}
