import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { RedemptionFullResponse } from '@control-aula/shared'

export const solicitudesService = {
  getAll: () =>
    api<RedemptionFullResponse[]>(API_ROUTES.SOLICITUDES.BASE).then(r => r.data),

  process: (id: string, status: 'approved' | 'rejected') =>
    api<null>(API_ROUTES.SOLICITUDES.BY_ID(id), {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    api<null>(API_ROUTES.SOLICITUDES.BY_ID(id), { method: 'DELETE' }),
}
