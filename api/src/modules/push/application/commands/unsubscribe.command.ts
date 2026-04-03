import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { IsNotEmpty, IsString }           from 'class-validator'
import { PushRepository }                 from '../../domain/push.repository'

export class UnsubscribeDto {
  @IsString() @IsNotEmpty() endpoint!: string
}

export class UnsubscribeCommand {
  constructor(public readonly endpoint: string) {}
}

@CommandHandler(UnsubscribeCommand)
export class UnsubscribeHandler implements ICommandHandler<UnsubscribeCommand, void> {
  constructor(private readonly repo: PushRepository) {}

  async execute({ endpoint }: UnsubscribeCommand): Promise<void> {
    await this.repo.removeByEndpoint(endpoint)
  }
}
