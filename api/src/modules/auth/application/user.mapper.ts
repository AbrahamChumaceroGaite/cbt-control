import type { UserEntity } from '../domain/user.entity'
import type { UserResponse } from '@control-aula/shared'

export class UserMapper {
  static toResponse(entity: Omit<UserEntity, 'passwordHash'>): UserResponse {
    return {
      id:       entity.id,
      name:     entity.fullName,
      email:    entity.code,
      role:     entity.role as import('@control-aula/shared').UserRole,
      isActive: entity.isActive,
    }
  }
}
