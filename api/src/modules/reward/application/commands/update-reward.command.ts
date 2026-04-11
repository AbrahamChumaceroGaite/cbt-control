import type { UpdateRewardDto } from './update-reward.dto'

export class UpdateRewardCommand {
  constructor(
    public readonly id:  string,
    public readonly dto: UpdateRewardDto,
  ) {}
}
