import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type {
  PortalStudentResponse, RewardResponse,
  CoinTransactionResponse, WeeklyBankStatus, StudentSearchResult,
  CreateTransactionInput,
} from '@control-aula/shared'

export const portalService = {
  getMe: () =>
    api<PortalStudentResponse>(API_ROUTES.PORTAL.ME).then(r => r.data),

  getRewards: () =>
    api<RewardResponse[]>(API_ROUTES.PORTAL.REWARDS).then(r => r.data),

  requestReward: (rewardId: string) =>
    api<null>(API_ROUTES.PORTAL.SOLICITUDES, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ rewardId }),
    }),

  updateProfile: (data: { avatarUrl?: string; bannerUrl?: string }) =>
    api<null>(API_ROUTES.PORTAL.PROFILE, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }),

  getBankStatus: () =>
    api<WeeklyBankStatus>(API_ROUTES.BANK.STATUS).then(r => r.data),

  getMyTransactions: () =>
    api<CoinTransactionResponse[]>(API_ROUTES.BANK.TRANSACTIONS).then(r => r.data),

  cancelRedemption: (id: string) =>
    api<null>(API_ROUTES.PORTAL.SOL_BY_ID(id), { method: 'DELETE' }),

  getCourses: () =>
    api<{ id: string; name: string }[]>(API_ROUTES.BANK.COURSES).then(r => r.data),

  searchStudents: (q: string, courseId?: string) => {
    const params = new URLSearchParams({ q })
    if (courseId) params.set('courseId', courseId)
    return api<StudentSearchResult[]>(`${API_ROUTES.BANK.SEARCH}?${params}`).then(r => r.data)
  },

  createTransaction: (data: CreateTransactionInput) =>
    api<CoinTransactionResponse>(API_ROUTES.BANK.TRANSACTIONS, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }),
}

