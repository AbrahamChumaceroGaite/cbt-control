import { describe, it, expect } from 'vitest'
import { BadRequestException }  from '@nestjs/common'
import { GameEntity }           from '../game.entity'

const validDto = {
  slug:  'tank-invaders',
  title: 'Tank Invaders',
}

describe('GameEntity', () => {
  describe('create()', () => {
    it('creates a valid entity with defaults', () => {
      const entity = GameEntity.create(validDto)
      expect(entity.slug).toBe('tank-invaders')
      expect(entity.title).toBe('Tank Invaders')
      expect(entity.isActive).toBe(false)
      expect(entity.maxLevels).toBe(30)
      expect(entity.coinsPerLevelBase).toBe(5)
      expect(entity.coinsPerLevelStep).toBe(2)
      expect(entity.bonusCoins).toBe(4)
      expect(entity.continueCost).toBe(2)
    })

    it('throws when title is too short', () => {
      expect(() => GameEntity.create({ ...validDto, title: 'X' }))
        .toThrow(BadRequestException)
    })

    it('throws when title is empty', () => {
      expect(() => GameEntity.create({ ...validDto, title: '' }))
        .toThrow(BadRequestException)
    })

    it('throws when slug is too short', () => {
      expect(() => GameEntity.create({ ...validDto, slug: 'x' }))
        .toThrow(BadRequestException)
    })

    it('throws when slug contains invalid characters', () => {
      expect(() => GameEntity.create({ ...validDto, slug: 'Tank Invaders' }))
        .toThrow(BadRequestException)
    })

    it('throws when slug contains uppercase', () => {
      expect(() => GameEntity.create({ ...validDto, slug: 'Tank-Invaders' }))
        .toThrow(BadRequestException)
    })

    it('throws when maxLevels is 0', () => {
      expect(() => GameEntity.create({ ...validDto, maxLevels: 0 }))
        .toThrow(BadRequestException)
    })

    it('throws when maxLevels exceeds 100', () => {
      expect(() => GameEntity.create({ ...validDto, maxLevels: 101 }))
        .toThrow(BadRequestException)
    })

    it('throws when coinsPerLevelBase is 0', () => {
      expect(() => GameEntity.create({ ...validDto, coinsPerLevelBase: 0 }))
        .toThrow(BadRequestException)
    })

    it('throws when continueCost is negative', () => {
      expect(() => GameEntity.create({ ...validDto, continueCost: -1 }))
        .toThrow(BadRequestException)
    })

    it('accepts continueCost of 0 (free continues)', () => {
      const entity = GameEntity.create({ ...validDto, continueCost: 0 })
      expect(entity.continueCost).toBe(0)
    })
  })

  describe('coinsForLevel()', () => {
    it('returns base for level 1', () => {
      const entity = GameEntity.create({ ...validDto, coinsPerLevelBase: 5, coinsPerLevelStep: 2 })
      expect(entity.coinsForLevel(1)).toBe(5)
    })

    it('returns base + step for level 2', () => {
      const entity = GameEntity.create({ ...validDto, coinsPerLevelBase: 5, coinsPerLevelStep: 2 })
      expect(entity.coinsForLevel(2)).toBe(7)
    })

    it('returns correct coins for level 30', () => {
      const entity = GameEntity.create({ ...validDto, coinsPerLevelBase: 5, coinsPerLevelStep: 2 })
      // 5 + (30-1) * 2 = 5 + 58 = 63
      expect(entity.coinsForLevel(30)).toBe(63)
    })
  })
})
