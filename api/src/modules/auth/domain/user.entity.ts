import type { UserRole, SessionPayload } from '@control-aula/shared'

export type { UserRole, SessionPayload }

export interface UserEntity {
  id:           string
  code:         string
  passwordHash: string
  role:         UserRole
  studentId:    string | null
  fullName:     string
  isActive:     boolean
  createdAt:    Date
  updatedAt:    Date
}
