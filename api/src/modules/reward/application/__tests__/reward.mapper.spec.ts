import { RewardMapper }  from '../reward.mapper'
import { RewardEntity }  from '../../domain/reward.entity'

const makeEntity = (): RewardEntity => new RewardEntity({
  id:             'r1',
  name:           'Punto Extra',
  description:    'Agrega un punto a la nota',
  icon:           '⭐',
  coinsRequired:  50,
  discount:       10,
  discountEndsAt: null,
  type:           'individual',
  isGlobal:       false,
  isActive:       true,
  createdAt:      new Date(),
  updatedAt:      new Date(),
})

describe('RewardMapper', () => {
  describe('toResponse()', () => {
    it('maps all public fields', () => {
      const result = RewardMapper.toResponse(makeEntity())
      expect(result.id).toBe('r1')
      expect(result.name).toBe('Punto Extra')
      expect(result.description).toBe('Agrega un punto a la nota')
      expect(result.icon).toBe('⭐')
      expect(result.coinsRequired).toBe(50)
      expect(result.discount).toBe(10)
      expect(result.type).toBe('individual')
      expect(result.isGlobal).toBe(false)
      expect(result.isActive).toBe(true)
    })

    it('does not expose discountEndsAt, createdAt, or updatedAt', () => {
      const result = RewardMapper.toResponse(makeEntity())
      expect(result).not.toHaveProperty('discountEndsAt')
      expect(result).not.toHaveProperty('createdAt')
      expect(result).not.toHaveProperty('updatedAt')
    })
  })
})
