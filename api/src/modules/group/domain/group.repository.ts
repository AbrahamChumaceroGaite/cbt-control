import type { GroupEntity } from './group.entity'

export abstract class GroupRepository {
  abstract findAll(courseId?: string): Promise<GroupEntity[]>
  abstract findById(id: string): Promise<GroupEntity | null>
  abstract create(data: { name: string; courseId: string; studentIds?: string[] }): Promise<GroupEntity>
  abstract update(id: string, data: { name?: string; studentIds?: string[] }): Promise<GroupEntity>
  abstract delete(id: string): Promise<void>
}
