'use client'
import { useAuthStore } from '@/store/auth.store'

export function useAuth() {
  const user    = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)
  const logout  = useAuthStore(s => s.logout)

  return {
    user,
    setUser,
    logout,
    isAuthenticated: user !== null,
  }
}
