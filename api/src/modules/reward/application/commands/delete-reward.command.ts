import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { RewardRepository } from '../../domain/reward.repository'

export class DeleteRewardCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteRewardCommand)
export class DeleteRewardHandler implements ICommandHandler<DeleteRewardCommand, void> {
  constructor(private readonly repo: RewardRepository) {}

  async execute({ id }: DeleteRewardCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
