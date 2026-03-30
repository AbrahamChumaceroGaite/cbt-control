import type { CoinLogResponse }    from './student.types'
import type { RedemptionResponse } from './reward.types'

export type PortalStudentResponse = {
  id:     string
  name:   string
  coins:  number
  course: { id: string; name: string; level: string; classCoins: number }
  coinLogs:              CoinLogResponse[]
  groupMemberships:      { group: { id: string; name: string } }[]
  redemptionRequests:    RedemptionResponse[]
  individualRedemptions: { rewardId: string }[]
}
