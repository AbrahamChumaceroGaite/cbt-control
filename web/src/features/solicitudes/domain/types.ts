import type { RedemptionFullResponse } from '@control-aula/shared'

// DB alias — field names kept as-is (Spanish from backend)
export type SolicitudViewModel = RedemptionFullResponse

export type StatusFilter = 'pending' | 'all'

export const STATUS_LABEL: Record<string, string> = {
  approved: 'Aprobado',
  rejected: 'Rechazado',
  pending:  'Pendiente',
}

export const STATUS_CLASS: Record<string, string> = {
  approved: 'bg-green-900/50 text-green-400',
  rejected: 'bg-red-900/50 text-red-400',
  pending:  'bg-amber-900/50 text-amber-400',
}
