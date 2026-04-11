import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { RewardResponse, RewardInput } from '@control-aula/shared'

export const recompensasService = {
  getAll: () =>
    api<RewardResponse[]>(API_ROUTES.REWARDS.BASE).then(r => r.data),

  create: (body: RewardInput) =>
    api<RewardResponse>(API_ROUTES.REWARDS.BASE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  update: (id: string, body: RewardInput) =>
    api<RewardResponse>(API_ROUTES.REWARDS.BY_ID(id), {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  delete: (id: string) =>
    api<null>(API_ROUTES.REWARDS.BY_ID(id), { method: 'DELETE' }),
}
