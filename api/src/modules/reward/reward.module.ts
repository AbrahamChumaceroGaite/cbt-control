import { Module }                  from '@nestjs/common'
import { CqrsModule }               from '@nestjs/cqrs'
import { RewardController }         from './presentation/reward.controller'
import { SolicitudesController }    from './presentation/solicitudes.controller'
import { RewardRepository }         from './domain/reward.repository'
import { RewardRepositoryImpl }     from './infrastructure/reward.repository.impl'
import { GetRewardsHandler }        from './application/queries/get-rewards.handler'
import { CreateRewardHandler }      from './application/commands/create-reward.handler'
import { UpdateRewardHandler }      from './application/commands/update-reward.handler'
import { DeleteRewardHandler }      from './application/commands/delete-reward.handler'
import { ProcessRedemptionHandler } from './application/commands/process-redemption.handler'
import { AuthModule }               from '../auth/auth.module'
import { PushModule }               from '../push/push.module'

const handlers = [GetRewardsHandler, CreateRewardHandler, UpdateRewardHandler, DeleteRewardHandler, ProcessRedemptionHandler]

@Module({
  imports:     [CqrsModule, AuthModule, PushModule],
  controllers: [RewardController, SolicitudesController],
  providers:   [
    { provide: RewardRepository, useClass: RewardRepositoryImpl },
    ...handlers,
  ],
})
export class RewardModule {}
