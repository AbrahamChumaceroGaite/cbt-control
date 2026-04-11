import { RequestRewardDto } from './request-reward.dto'

export class RequestRewardCommand {
  constructor(
    public readonly studentId: string,
    public readonly dto: RequestRewardDto,
  ) {}
}
