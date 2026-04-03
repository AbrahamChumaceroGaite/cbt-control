import { apiFetch, apiFetchFull } from '@/lib/api'
import type { PortalStudentResponse, RewardResponse, RedemptionResponse } from '@control-aula/shared'

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
}

export type { PortalStudentResponse as StudentData, RedemptionResponse as RedemptionReq }
