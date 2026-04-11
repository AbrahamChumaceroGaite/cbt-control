'use client'
import { useAuthStore }       from '@/store/auth.store'
import { ROLES, type UserRole } from '@/config/roles'

export function usePermission() {
  const user = useAuthStore(s => s.user)

  /** Returns true if the current user has exactly this role. */
  const hasRole = (role: UserRole): boolean => user?.role === role

  /** Alias for hasRole — readable as "can(ROLES.ADMIN)". */
  const can = (role: UserRole): boolean => hasRole(role)

  const isAdmin   = hasRole(ROLES.ADMIN)
  const isStudent = hasRole(ROLES.STUDENT)

  return { can, hasRole, isAdmin, isStudent }
}
