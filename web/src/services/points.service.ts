import { apiFetch } from '@/lib/api'
import type { AwardCoinInput, CoinLogResponse } from '@control-aula/shared'

export const pointsService = {
  award: (body: AwardCoinInput) =>
    apiFetch<CoinLogResponse>('/api/puntos', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),
}
