import { Module }               from '@nestjs/common'
import { CqrsModule }            from '@nestjs/cqrs'
import { PortalController }      from './portal.controller'
import { PortalRepository }      from './domain/portal.repository'
import { PortalRepositoryImpl }  from './infrastructure/portal.repository.impl'
import { GetPortalStudentHandler }     from './application/queries/get-portal-student.query'
import { GetIndividualRewardsHandler } from './application/queries/get-individual-rewards.query'
import { RequestRewardHandler }        from './application/commands/request-reward.command'
import { AuthModule }            from '../auth/auth.module'

const handlers = [GetPortalStudentHandler, GetIndividualRewardsHandler, RequestRewardHandler]

@Module({
  imports:     [CqrsModule, AuthModule],
  controllers: [PortalController],
  providers:   [
    { provide: PortalRepository, useClass: PortalRepositoryImpl },
    ...handlers,
  ],
})
export class PortalModule {}
