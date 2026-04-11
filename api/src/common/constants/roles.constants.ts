export const ROLES = {
  ADMIN:   'admin',
  STUDENT: 'student',
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]
