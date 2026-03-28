export type CoinLogEntry = {
  id: string; coins: number; reason: string; createdAt: string
  action?: { name: string; category: string } | null
}
export type RedemptionReq = {
  id: string; status: string; createdAt: string; notes: string
  reward: { name: string; icon: string; coinsRequired: number }
}
export type GroupEntry = { group: { id: string; name: string } }
export type IndividualReward = { id: string; name: string; icon: string; coinsRequired: number; description: string }
export type StudentData = {
  id: string; name: string; coins: number
  course: { id: string; name: string; level: string; classCoins: number }
  coinLogs: CoinLogEntry[]
  groupMemberships: GroupEntry[]
  redemptionRequests: RedemptionReq[]
  individualRedemptions: { rewardId: string }[]
}
