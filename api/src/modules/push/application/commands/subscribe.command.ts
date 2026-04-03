import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { PushRepository } from '../../domain/push.repository'

export class PushKeysDto {
  @IsString() @IsNotEmpty() p256dh!: string
  @IsString() @IsNotEmpty() auth!:   string
}

export class SubscribeDto {
  @IsString()    @IsNotEmpty()             endpoint!: string
  @ValidateNested() @Type(() => PushKeysDto) keys!:   PushKeysDto
}

export class SubscribeCommand {
  constructor(public readonly userId: string, public readonly dto: SubscribeDto) {}
}

@CommandHandler(SubscribeCommand)
export class SubscribeHandler implements ICommandHandler<SubscribeCommand, void> {
  constructor(private readonly repo: PushRepository) {}

  async execute({ userId, dto }: SubscribeCommand): Promise<void> {
    await this.repo.upsert(userId, dto.endpoint, dto.keys.p256dh, dto.keys.auth)
  }
}
