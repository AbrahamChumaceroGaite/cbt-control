import type { RedemptionFullResponse } from '@control-aula/shared'

// DB alias — field names kept as-is (Spanish from backend)
export type SolicitudViewModel = RedemptionFullResponse

export type StatusFilter = 'pending' | 'all'
