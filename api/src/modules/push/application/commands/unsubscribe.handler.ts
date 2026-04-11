import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PushRepository }                 from '../../domain/push.repository'
import { UnsubscribeCommand }             from './unsubscribe.command'

@CommandHandler(UnsubscribeCommand)
export class UnsubscribeHandler implements ICommandHandler<UnsubscribeCommand, void> {
  constructor(private readonly repo: PushRepository) {}

  async execute({ endpoint }: UnsubscribeCommand): Promise<void> {
    await this.repo.removeByEndpoint(endpoint)
  }
}
