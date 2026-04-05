import { apiFetch, apiFetchFull } from '@/lib/api'
import type { PortalStudentResponse, RewardResponse, RedemptionResponse, CoinTransactionResponse, WeeklyBankStatus, StudentSearchResult, CreateTransactionInput } from '@control-aula/shared'

export type { RewardResponse as IndividualReward }

export const portalService = {
  getMe: () =>
    apiFetch<PortalStudentResponse>('/api/portal/me'),

  getRewards: () =>
    apiFetch<RewardResponse[]>('/api/portal/recompensas'),

  requestReward: (rewardId: string) =>
    apiFetchFull<null>('/api/portal/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId }),
    }),

  updateProfile: (data: { avatarUrl?: string; bannerUrl?: string }) =>
    apiFetchFull<null>('/api/portal/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // ── Bank ───────────────────────────────────────────────���──────────────────

  getBankStatus: () =>
    apiFetch<WeeklyBankStatus>('/api/bank/status'),

  getMyTransactions: () =>
    apiFetch<CoinTransactionResponse[]>('/api/bank/transactions'),

  searchStudents: (q: string) =>
    apiFetch<StudentSearchResult[]>(`/api/bank/search?q=${encodeURIComponent(q)}`),

  createTransaction: (data: CreateTransactionInput) =>
    apiFetchFull<CoinTransactionResponse>('/api/bank/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
}

export type { PortalStudentResponse as StudentData, RedemptionResponse as RedemptionReq, CoinTransactionResponse, WeeklyBankStatus, StudentSearchResult }
