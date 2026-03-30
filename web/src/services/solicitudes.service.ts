import { apiFetch } from '@/lib/api'
import type { RedemptionFullResponse } from '@control-aula/shared'

export type { RedemptionFullResponse as SolicitudFull }

export const solicitudesService = {
  getAll: () =>
    apiFetch<RedemptionFullResponse[]>('/api/solicitudes'),

  process: (id: string, status: 'approved' | 'rejected') =>
    apiFetch<null>(`/api/solicitudes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    apiFetch<null>(`/api/solicitudes/${id}`, { method: 'DELETE' }),
}
