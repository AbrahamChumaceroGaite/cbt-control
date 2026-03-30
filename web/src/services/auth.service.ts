import { apiFetch } from '@/lib/api'

type LoginBody = { code: string; mode: 'admin' | 'student'; password?: string }
type LoginResponse = { user: { role: string; fullName?: string; code?: string } }

export const authService = {
  login: (body: LoginBody) =>
    apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  logout: () =>
    apiFetch<null>('/api/auth/logout', { method: 'POST' }),

  me: () =>
    apiFetch<{ user: { fullName?: string; code?: string } }>('/api/auth/me'),
}
