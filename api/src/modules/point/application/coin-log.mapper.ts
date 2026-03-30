import type { CoinLogEntity } from '../domain/coin-log.entity'
import type { CoinLogResponse } from '@control-aula/shared'

export class CoinLogMapper {
  static toResponse(entity: CoinLogEntity): CoinLogResponse {
    return {
      id:        entity.id,
      coins:     entity.coins,
      reason:    entity.reason,
      createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      student:   entity.student,
      action:    entity.action,
    }
  }
}
