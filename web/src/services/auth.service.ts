import { apiFetch } from '@/lib/api'
import type { SessionPayload } from '@control-aula/shared'

type LoginBody    = { code: string; password?: string }
type LoginResult  = { user: SessionPayload }

export const authService = {
  login: (body: LoginBody) =>
    apiFetch<LoginResult>('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  logout: () =>
    apiFetch<null>('/api/auth/logout', { method: 'POST' }),

  me: () =>
    apiFetch<SessionPayload>('/api/auth/me'),
}
