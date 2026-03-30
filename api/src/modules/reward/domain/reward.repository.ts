import type { RewardEntity } from './reward.entity'

export abstract class RewardRepository {
  abstract findAll(): Promise<RewardEntity[]>
  abstract findById(id: string): Promise<RewardEntity | null>
  abstract create(data: { name: string; coinsRequired: number; description?: string; icon?: string; type?: string; isGlobal?: boolean }): Promise<RewardEntity>
  abstract update(id: string, data: Partial<{ name: string; description: string; icon: string; coinsRequired: number; type: string; isGlobal: boolean; isActive: boolean }>): Promise<RewardEntity>
  abstract delete(id: string): Promise<void>
}
