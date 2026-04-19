import { describe, it, expect } from 'vitest'
import { GameMapper }  from '../game.mapper'
import { GameEntity }  from '../../domain/game.entity'

function makeEntity(): GameEntity {
  return GameEntity.create({
    id:                'g1',
    slug:              'tank-invaders',
    title:             'Tank Invaders',
    description:       'A classic arcade shooter',
    coverUrl:          '/covers/tank-invaders.jpg',
    iconEmoji:         '🎮',
    isActive:          true,
    maxLevels:         30,
    coinsPerLevelBase: 5,
    coinsPerLevelStep: 2,
    bonusCoins:        4,
    continueCost:      2,
    createdAt:         new Date('2026-01-01T00:00:00.000Z'),
  })
}

describe('GameMapper', () => {
  describe('toResponse()', () => {
    it('maps all fields correctly', () => {
      const response = GameMapper.toResponse(makeEntity())

      expect(response.id).toBe('g1')
      expect(response.slug).toBe('tank-invaders')
      expect(response.title).toBe('Tank Invaders')
      expect(response.description).toBe('A classic arcade shooter')
      expect(response.coverUrl).toBe('/covers/tank-invaders.jpg')
      expect(response.iconEmoji).toBe('🎮')
      expect(response.isActive).toBe(true)
      expect(response.maxLevels).toBe(30)
      expect(response.coinsPerLevelBase).toBe(5)
      expect(response.coinsPerLevelStep).toBe(2)
      expect(response.bonusCoins).toBe(4)
      expect(response.continueCost).toBe(2)
      expect(response.createdAt).toBe('2026-01-01T00:00:00.000Z')
    })

    it('createdAt is an ISO string', () => {
      const response = GameMapper.toResponse(makeEntity())
      expect(typeof response.createdAt).toBe('string')
      expect(() => new Date(response.createdAt)).not.toThrow()
    })
  })
})
