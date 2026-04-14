import { describe, it, expect } from 'vitest'
import { getDeals } from '../getDeals'
import type { IndividualReward } from '../../domain/types'

const makeReward = (id: string, coins: number, discount = 0): IndividualReward => ({
  id,
  name:          `Reward ${id}`,
  description:   '',
  icon:          '⭐',
  coinsRequired: coins,
  discount,
  type:          'individual',
  isGlobal:      false,
  isActive:      true,
})

describe('getDeals', () => {
  it('returns empty array when rewards list is empty', () => {
    expect(getDeals([])).toEqual([])
  })

  it('returns backend discounts when at least 2 rewards have discount > 0', () => {
    const rewards = [
      makeReward('r1', 100, 20),
      makeReward('r2', 200, 15),
    ]
    const deals = getDeals(rewards)
    expect(deals).toHaveLength(2)
    expect(deals.find(d => d.id === 'r1')?.discount).toBe(20)
    expect(deals.find(d => d.id === 'r2')?.discount).toBe(15)
  })

  it('computes salePrice correctly from backend discount', () => {
    const rewards = [makeReward('r1', 100, 20), makeReward('r2', 200, 10)]
    const deals = getDeals(rewards)
    expect(deals.find(d => d.id === 'r1')?.salePrice).toBe(80)   // 100 * 0.8
    expect(deals.find(d => d.id === 'r2')?.salePrice).toBe(180)  // 200 * 0.9
  })

  it('salePrice is at least 1 even for full discount', () => {
    const rewards = [makeReward('r1', 1, 100), makeReward('r2', 50, 100)]
    const deals = getDeals(rewards)
    deals.forEach(d => expect(d.salePrice).toBeGreaterThanOrEqual(1))
  })

  it('falls back to seeded random selection when fewer than 2 backend discounts', () => {
    const rewards = Array.from({ length: 5 }, (_, i) => makeReward(`r${i}`, (i + 1) * 50))
    const deals = getDeals(rewards)
    expect(deals.length).toBeGreaterThanOrEqual(2)
    expect(deals.length).toBeLessThanOrEqual(5)
    deals.forEach(d => {
      expect(d.discount).toBeGreaterThan(0)
      expect(d.salePrice).toBeGreaterThanOrEqual(1)
    })
  })

  it('returns deterministic results for same seed window', () => {
    const rewards = Array.from({ length: 5 }, (_, i) => makeReward(`r${i}`, (i + 1) * 50))
    const deals1 = getDeals(rewards)
    const deals2 = getDeals(rewards)
    expect(deals1.map(d => d.id)).toEqual(deals2.map(d => d.id))
  })
})
