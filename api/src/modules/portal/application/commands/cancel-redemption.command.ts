import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { PortalRepository } from '../../domain/portal.repository'

export class CancelRedemptionCommand {
  constructor(
    public readonly studentId: string,
    public readonly requestId: string,
  ) {}
}

@CommandHandler(CancelRedemptionCommand)
export class CancelRedemptionHandler implements ICommandHandler<CancelRedemptionCommand, void> {
  constructor(private readonly repo: PortalRepository) {}

  execute({ studentId, requestId }: CancelRedemptionCommand): Promise<void> {
    return this.repo.cancelRedemption(studentId, requestId)
  }
}
