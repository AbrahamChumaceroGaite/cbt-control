import type { RewardEntity } from '../domain/reward.entity'
import type { RewardResponse } from '@control-aula/shared'

export class RewardMapper {
  static toResponse(entity: RewardEntity): RewardResponse {
    return {
      id:            entity.id,
      name:          entity.name,
      description:   entity.description,
      icon:          entity.icon,
      coinsRequired: entity.coinsRequired,
      type:          entity.type,
      isGlobal:      entity.isGlobal,
      isActive:      entity.isActive,
    }
  }
}
