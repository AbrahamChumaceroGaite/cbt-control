import { describe, it, expect } from 'vitest'
import { LevelMapper }  from '../level.mapper'
import { LevelEntity }  from '../../domain/level.entity'

function makeEntity(): LevelEntity {
  return LevelEntity.fromRecord({
    id:             'lv1',
    gameId:         'g1',
    number:         1,
    speedMult:      1.0,
    fireRateMult:   1.0,
    enemyColsCount: 6,
    enemyRowsCount: 3,
    bunkerCount:    4,
    hasMysteryTank: false,
    specialEvent:   'none',
    isBoss:         false,
    bossHits:       1,
    enemyMixLight:  80,
    enemyMixMedium: 15,
    enemyMixHeavy:  5,
  })
}

describe('LevelMapper', () => {
  describe('toResponse()', () => {
    it('maps id, gameId, number', () => {
      const r = LevelMapper.toResponse(makeEntity())
      expect(r.id).toBe('lv1')
      expect(r.gameId).toBe('g1')
      expect(r.number).toBe(1)
    })

    it('maps config fields', () => {
      const r = LevelMapper.toResponse(makeEntity())
      expect(r.config.speedMult).toBe(1.0)
      expect(r.config.fireRateMult).toBe(1.0)
      expect(r.config.enemyCols).toBe(6)
      expect(r.config.enemyRows).toBe(3)
      expect(r.config.bunkerCount).toBe(4)
      expect(r.config.hasMysteryTank).toBe(false)
      expect(r.config.isBoss).toBe(false)
      expect(r.config.bossHits).toBe(1)
    })

    it('maps enemy mix percentages', () => {
      const r = LevelMapper.toResponse(makeEntity())
      expect(r.config.enemyMix.light).toBe(80)
      expect(r.config.enemyMix.medium).toBe(15)
      expect(r.config.enemyMix.heavy).toBe(5)
    })

    it('maps specialEvent', () => {
      const r = LevelMapper.toResponse(makeEntity())
      expect(r.config.specialEvent).toBe('none')
    })
  })
})
