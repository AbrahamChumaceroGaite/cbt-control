import { apiFetch, apiFetchFull } from '@/lib/api'
import type { RewardResponse, RewardInput } from '@control-aula/shared'

export const rewardsService = {
  getAll: () =>
    apiFetch<RewardResponse[]>('/api/recompensas'),

  create: (body: RewardInput) =>
    apiFetchFull<RewardResponse>('/api/recompensas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  update: (id: string, body: RewardInput) =>
    apiFetchFull<RewardResponse>(`/api/recompensas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetchFull<null>(`/api/recompensas/${id}`, { method: 'DELETE' }),
}
