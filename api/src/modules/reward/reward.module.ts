import { Module }                   from '@nestjs/common'
import { CqrsModule }                from '@nestjs/cqrs'
import { RewardController }          from './reward.controller'
import { SolicitudesController }     from './solicitudes.controller'
import { RewardRepository }          from './domain/reward.repository'
import { RewardRepositoryImpl }      from './infrastructure/reward.repository.impl'
import { GetRewardsHandler }         from './application/queries/get-rewards.query'
import { CreateRewardHandler }       from './application/commands/create-reward.command'
import { UpdateRewardHandler }       from './application/commands/update-reward.command'
import { DeleteRewardHandler }       from './application/commands/delete-reward.command'
import { ProcessRedemptionHandler }  from './application/commands/process-redemption.command'
import { AuthModule }                from '../auth/auth.module'

const handlers = [GetRewardsHandler, CreateRewardHandler, UpdateRewardHandler, DeleteRewardHandler, ProcessRedemptionHandler]

@Module({
  imports:     [CqrsModule, AuthModule],
  controllers: [RewardController, SolicitudesController],
  providers:   [
    { provide: RewardRepository, useClass: RewardRepositoryImpl },
    ...handlers,
  ],
})
export class RewardModule {}
