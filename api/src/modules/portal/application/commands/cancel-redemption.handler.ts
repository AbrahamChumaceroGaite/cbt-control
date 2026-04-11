import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PortalRepository }               from '../../domain/portal.repository'
import { CancelRedemptionCommand }        from './cancel-redemption.command'

@CommandHandler(CancelRedemptionCommand)
export class CancelRedemptionHandler implements ICommandHandler<CancelRedemptionCommand, void> {
  constructor(private readonly repo: PortalRepository) {}

  execute({ studentId, requestId }: CancelRedemptionCommand): Promise<void> {
    return this.repo.cancelRedemption(studentId, requestId)
  }
}
