import { Module }               from '@nestjs/common'
import { CqrsModule }            from '@nestjs/cqrs'
import { PortalController }      from './presentation/portal.controller'
import { PortalRepository }      from './domain/portal.repository'
import { PortalRepositoryImpl }  from './infrastructure/portal.repository.impl'
import { GetPortalStudentHandler }     from './application/queries/get-portal-student.handler'
import { GetIndividualRewardsHandler } from './application/queries/get-individual-rewards.handler'
import { RequestRewardHandler }        from './application/commands/request-reward.handler'
import { UpdateProfileHandler }        from './application/commands/update-profile.handler'
import { CancelRedemptionHandler }     from './application/commands/cancel-redemption.handler'
import { AuthModule }            from '../auth/auth.module'
import { PushModule }            from '../push/push.module'

const handlers = [
  GetPortalStudentHandler,
  GetIndividualRewardsHandler,
  RequestRewardHandler,
  UpdateProfileHandler,
  CancelRedemptionHandler,
]

@Module({
  imports:     [CqrsModule, AuthModule, PushModule],
  controllers: [PortalController],
  providers:   [
    { provide: PortalRepository, useClass: PortalRepositoryImpl },
    ...handlers,
  ],
})
export class PortalModule {}
