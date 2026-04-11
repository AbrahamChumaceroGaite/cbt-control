import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { RewardRepository }    from '../../domain/reward.repository'
import { DeleteRewardCommand } from './delete-reward.command'

@CommandHandler(DeleteRewardCommand)
export class DeleteRewardHandler implements ICommandHandler<DeleteRewardCommand, void> {
  constructor(private readonly repo: RewardRepository) {}

  async execute({ id }: DeleteRewardCommand): Promise<void> {
    await this.repo.delete(id)
  }
}
