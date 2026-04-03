import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator'
import { InboxRepository } from '../../domain/inbox.repository'

export class BatchInboxDto {
  @IsIn(['mark-all-read', 'delete-many', 'delete-all']) action!: string
  @IsOptional() @IsArray() @IsString({ each: true }) ids?: string[]
}

export class BatchInboxCommand {
  constructor(public readonly userId: string, public readonly dto: BatchInboxDto) {}
}

@CommandHandler(BatchInboxCommand)
export class BatchInboxHandler implements ICommandHandler<BatchInboxCommand, void> {
  constructor(private readonly repo: InboxRepository) {}

  async execute({ userId, dto }: BatchInboxCommand): Promise<void> {
    switch (dto.action) {
      case 'mark-all-read': return this.repo.markAllRead(userId)
      case 'delete-all':    return this.repo.deleteAll(userId)
      case 'delete-many':   return this.repo.deleteMany(dto.ids ?? [], userId)
    }
  }
}
