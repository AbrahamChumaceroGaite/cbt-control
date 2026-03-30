import type { ActionEntity } from './action.entity'

export abstract class ActionRepository {
  abstract findAll(): Promise<ActionEntity[]>
  abstract findById(id: string): Promise<ActionEntity | null>
  abstract create(data: { name: string; coins: number; category?: string; affectsClass?: boolean; affectsStudent?: boolean }): Promise<ActionEntity>
  abstract update(id: string, data: Partial<{ name: string; coins: number; category: string; affectsClass: boolean; affectsStudent: boolean; isActive: boolean }>): Promise<ActionEntity>
  abstract delete(id: string): Promise<void>
}
