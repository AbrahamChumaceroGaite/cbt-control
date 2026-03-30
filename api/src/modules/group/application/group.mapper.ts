import type { GroupEntity } from '../domain/group.entity'
import type { GroupResponse } from '@control-aula/shared'

export class GroupMapper {
  static toResponse(entity: GroupEntity): GroupResponse {
    return {
      id:       entity.id,
      name:     entity.name,
      courseId: entity.courseId,
      members:  entity.members,
    }
  }
}
