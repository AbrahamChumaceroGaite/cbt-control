import type { CreateRewardDto } from './create-reward.dto'

export class CreateRewardCommand {
  constructor(public readonly dto: CreateRewardDto) {}
}
