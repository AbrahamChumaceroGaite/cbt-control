import type { UserEntity } from './user.entity'

export abstract class UserRepository {
  abstract findAll(): Promise<Omit<UserEntity, 'passwordHash'>[]>
  abstract findByCode(code: string): Promise<UserEntity | null>
  abstract findById(id: string): Promise<UserEntity | null>
  abstract create(data: { code: string; passwordHash: string; role: string; studentId?: string; fullName?: string }): Promise<Omit<UserEntity, 'passwordHash'>>
  abstract update(id: string, data: Partial<{ code: string; passwordHash: string; role: string; fullName: string; isActive: boolean }>): Promise<Omit<UserEntity, 'passwordHash'>>
  abstract delete(id: string): Promise<void>
}
