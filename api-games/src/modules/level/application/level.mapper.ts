import type { LevelEntity }   from '../domain/level.entity'
import type { LevelResponse } from '@control-aula/shared'

export class LevelMapper {
  static toResponse(entity: LevelEntity): LevelResponse {
    return {
      id:     entity.id,
      gameId: entity.gameId,
      number: entity.number,
      config: entity.toConfig(),
    }
  }
}
