import { apiFetch } from '@/lib/api'
import type { RewardResponse, RewardInput } from '@control-aula/shared'

export const rewardsService = {
  getAll: () =>
    apiFetch<RewardResponse[]>('/api/recompensas'),

  create: (body: RewardInput) =>
    apiFetch<RewardResponse>('/api/recompensas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  update: (id: string, body: RewardInput) =>
    apiFetch<RewardResponse>(`/api/recompensas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<null>(`/api/recompensas/${id}`, { method: 'DELETE' }),
}
