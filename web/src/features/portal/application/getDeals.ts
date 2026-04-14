import type { IndividualReward, RewardWithDiscount, Deal } from '../domain/types'

function seededRng(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297 + 233280) * 233280
  return x - Math.floor(x)
}

export function getDeals(rewards: IndividualReward[]): Deal[] {
  const withDiscount = rewards.filter(r => ((r as RewardWithDiscount).discount ?? 0) > 0)
  if (withDiscount.length >= 2) {
    return withDiscount.map(r => {
      const disc = (r as RewardWithDiscount).discount ?? 0
      return { ...r, discount: disc, salePrice: Math.max(1, Math.round(r.coinsRequired * (1 - disc / 100))) }
    })
  }
  if (rewards.length === 0) return []
  const seed    = Math.floor(Date.now() / (1000 * 60 * 60 * 48))
  const count   = Math.min(Math.max(2, Math.floor(rewards.length * 0.4)), 5)
  const pcts    = [10, 15, 20, 25, 30]
  const shuffled = [...rewards].sort((a, b) => seededRng(seed, a.coinsRequired) - seededRng(seed, b.coinsRequired))
  return shuffled.slice(0, count).map((r, i) => {
    const disc = pcts[Math.floor(seededRng(seed + 1, i * 3) * pcts.length)]
    return { ...r, discount: disc, salePrice: Math.max(1, Math.round(r.coinsRequired * (1 - disc / 100))) }
  })
}
