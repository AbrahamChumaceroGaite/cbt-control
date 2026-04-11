import { create } from 'zustand'

export interface Toast {
  id:      string
  message: string
  success: boolean
}

interface UiState {
  toasts:         Toast[]
  addToast:       (message: string, success?: boolean) => string
  removeToast:    (id: string) => void
  sidebarOpen:    boolean
  setSidebarOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  toasts:      [],
  sidebarOpen: false,

  addToast: (message, success = true) => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { id, message, success }] }))
    return id
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
