import { RewardEntity } from '../reward.entity'

const validProps = {
  id:             'r1',
  name:           'Punto Extra',
  description:    'Agrega un punto a la nota',
  icon:           '⭐',
  coinsRequired:  50,
  discount:       0,
  discountEndsAt: null,
  type:           'individual',
  isGlobal:       false,
  isActive:       true,
  createdAt:      new Date(),
  updatedAt:      new Date(),
}

describe('RewardEntity', () => {
  describe('constructor — valid data', () => {
    it('creates an entity with all valid props', () => {
      const entity = new RewardEntity(validProps)
      expect(entity.id).toBe('r1')
      expect(entity.name).toBe('Punto Extra')
      expect(entity.coinsRequired).toBe(50)
    })
  })

  describe('validate() — name', () => {
    it('throws when name is empty', () => {
      expect(() => new RewardEntity({ ...validProps, name: '' }))
        .toThrow('Reward name must be at least 2 characters')
    })

    it('throws when name has only one character', () => {
      expect(() => new RewardEntity({ ...validProps, name: 'X' }))
        .toThrow('Reward name must be at least 2 characters')
    })

    it('throws when name is only whitespace', () => {
      expect(() => new RewardEntity({ ...validProps, name: '  ' }))
        .toThrow('Reward name must be at least 2 characters')
    })

    it('accepts name with exactly 2 characters', () => {
      expect(() => new RewardEntity({ ...validProps, name: 'OK' })).not.toThrow()
    })
  })

  describe('validate() — coinsRequired', () => {
    it('throws when coinsRequired is zero', () => {
      expect(() => new RewardEntity({ ...validProps, coinsRequired: 0 }))
        .toThrow('Required coins must be greater than zero')
    })

    it('throws when coinsRequired is negative', () => {
      expect(() => new RewardEntity({ ...validProps, coinsRequired: -10 }))
        .toThrow('Required coins must be greater than zero')
    })

    it('accepts positive coinsRequired', () => {
      expect(() => new RewardEntity({ ...validProps, coinsRequired: 1 })).not.toThrow()
    })
  })

  describe('validate() — discount', () => {
    it('throws when discount is negative', () => {
      expect(() => new RewardEntity({ ...validProps, discount: -1 }))
        .toThrow('Discount must be between 0 and 100')
    })

    it('throws when discount exceeds 100', () => {
      expect(() => new RewardEntity({ ...validProps, discount: 101 }))
        .toThrow('Discount must be between 0 and 100')
    })

    it('accepts discount of 0', () => {
      expect(() => new RewardEntity({ ...validProps, discount: 0 })).not.toThrow()
    })

    it('accepts discount of 100', () => {
      expect(() => new RewardEntity({ ...validProps, discount: 100 })).not.toThrow()
    })
  })
})
