import type { ActionEntity } from '../domain/action.entity'
import type { ActionResponse } from '@control-aula/shared'

export class ActionMapper {
  static toResponse(entity: ActionEntity): ActionResponse {
    return {
      id:             entity.id,
      name:           entity.name,
      coins:          entity.coins,
      category:       entity.category,
      affectsClass:   entity.affectsClass,
      affectsStudent: entity.affectsStudent,
      isActive:       entity.isActive,
    }
  }
}
