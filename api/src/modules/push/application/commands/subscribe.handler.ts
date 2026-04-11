import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PushRepository }                 from '../../domain/push.repository'
import { SubscribeCommand }               from './subscribe.command'

@CommandHandler(SubscribeCommand)
export class SubscribeHandler implements ICommandHandler<SubscribeCommand, void> {
  constructor(private readonly repo: PushRepository) {}

  async execute({ userId, dto }: SubscribeCommand): Promise<void> {
    await this.repo.upsert(userId, dto.endpoint, dto.keys.p256dh, dto.keys.auth)
  }
}
