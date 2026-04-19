import type { RewardResponse } from '@control-aula/shared'

export type PortalTab = 'perfil' | 'recompensas' | 'solicitudes' | 'bank' | 'games'

// UI state types
export type SendState     = 'idle' | 'sending' | 'success' | 'error'
export type HistoryFilter = 'all' | 'sent' | 'received'
export type StatusFilter  = 'all' | 'pending' | 'approved' | 'rejected'
export interface DateFilter { from: string; to: string }

// Domain aliases for rewards with discount metadata
export type RewardWithDiscount = RewardResponse & { discount?: number; icon?: string }
export type Deal               = RewardResponse & { discount: number; salePrice: number }

export type {
  PortalStudentResponse as StudentData,
  RedemptionResponse    as RedemptionReq,
  CoinTransactionResponse,
  WeeklyBankStatus,
  StudentSearchResult,
} from '@control-aula/shared'

export type { RewardResponse as IndividualReward } from '@control-aula/shared'
