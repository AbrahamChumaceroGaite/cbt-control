import { create } from 'zustand'
import type { SessionPayload } from '@control-aula/shared'

interface AuthState {
  user:    SessionPayload | null
  setUser: (payload: SessionPayload) => void
  logout:  () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user:    null,
  setUser: (payload) => set({ user: payload }),
  logout:  ()        => set({ user: null }),
}))
