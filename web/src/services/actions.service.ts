import { apiFetch, apiFetchFull } from '@/lib/api'
import type { ActionResponse, ActionInput } from '@control-aula/shared'

export const actionsService = {
  getAll: () =>
    apiFetch<ActionResponse[]>('/api/acciones'),

  create: (body: ActionInput) =>
    apiFetchFull<ActionResponse>('/api/acciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  update: (id: string, body: ActionInput) =>
    apiFetchFull<ActionResponse>(`/api/acciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetchFull<null>(`/api/acciones/${id}`, { method: 'DELETE' }),
}
