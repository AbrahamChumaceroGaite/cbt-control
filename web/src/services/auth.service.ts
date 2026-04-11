import { api } from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { SessionPayload } from '@control-aula/shared'

type LoginBody   = { code: string; password?: string }
type LoginResult = { user: SessionPayload }

export const authService = {
  login: (body: LoginBody) =>
    api<LoginResult>(API_ROUTES.AUTH.LOGIN, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }).then(r => r.data),

  logout: () =>
    api<null>(API_ROUTES.AUTH.LOGOUT, { method: 'POST' }).then(r => r.data),

  me: () =>
    api<SessionPayload>(API_ROUTES.AUTH.ME).then(r => r.data),
}
