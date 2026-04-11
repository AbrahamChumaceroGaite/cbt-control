import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { CoinTransactionResponse } from '@control-aula/shared'
import type { ProcessPayload } from '../domain/types'

export const transaccionesService = {
  getAll: () =>
    api<CoinTransactionResponse[]>(API_ROUTES.BANK.ADMIN_TXS).then(r => r.data),

  process: (id: string, payload: ProcessPayload) =>
    api<void>(API_ROUTES.BANK.ADMIN_TX_BY_ID(id), {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    }),
}
