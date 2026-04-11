import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { ActionResponse, ActionInput } from '@control-aula/shared'

export const accionesService = {
  getAll: () =>
    api<ActionResponse[]>(API_ROUTES.ACTIONS.BASE).then(r => r.data),

  create: (body: ActionInput) =>
    api<ActionResponse>(API_ROUTES.ACTIONS.BASE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  update: (id: string, body: ActionInput) =>
    api<ActionResponse>(API_ROUTES.ACTIONS.BY_ID(id), {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  delete: (id: string) =>
    api<null>(API_ROUTES.ACTIONS.BY_ID(id), { method: 'DELETE' }),
}
