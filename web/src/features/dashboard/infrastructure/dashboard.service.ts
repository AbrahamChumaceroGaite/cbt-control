import { api } from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { SessionPayload } from '@control-aula/shared'

export const dashboardService = {
  getProfile: () =>
    api<SessionPayload>(API_ROUTES.AUTH.ME).then(r => r.data),

  logout: () =>
    api<null>(API_ROUTES.AUTH.LOGOUT, { method: 'POST' }).then(r => r.data),
}
