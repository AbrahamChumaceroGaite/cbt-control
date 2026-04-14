import { ActionEntity } from '../action.entity'

const validProps = {
  id:             'a1',
  name:           'Participación',
  coins:          3,
  category:       'blue',
  affectsClass:   true,
  affectsStudent: true,
  isActive:       true,
  createdAt:      new Date(),
  updatedAt:      new Date(),
}

describe('ActionEntity', () => {
  describe('constructor — valid data', () => {
    it('creates an entity with all valid props', () => {
      const entity = new ActionEntity(validProps)
      expect(entity.id).toBe('a1')
      expect(entity.name).toBe('Participación')
      expect(entity.coins).toBe(3)
      expect(entity.isActive).toBe(true)
    })
  })

  describe('validate() — name', () => {
    it('throws when name is empty', () => {
      expect(() => new ActionEntity({ ...validProps, name: '' }))
        .toThrow('Action name must be at least 2 characters')
    })

    it('throws when name has only one character', () => {
      expect(() => new ActionEntity({ ...validProps, name: 'X' }))
        .toThrow('Action name must be at least 2 characters')
    })

    it('throws when name is only whitespace', () => {
      expect(() => new ActionEntity({ ...validProps, name: '  ' }))
        .toThrow('Action name must be at least 2 characters')
    })

    it('accepts name with exactly 2 characters', () => {
      expect(() => new ActionEntity({ ...validProps, name: 'Ok' })).not.toThrow()
    })
  })

  describe('validate() — coins', () => {
    it('throws when coins is zero', () => {
      expect(() => new ActionEntity({ ...validProps, coins: 0 }))
        .toThrow('Action coins cannot be zero')
    })

    it('accepts negative coins (penalty actions)', () => {
      expect(() => new ActionEntity({ ...validProps, coins: -3 })).not.toThrow()
    })

    it('accepts positive coins', () => {
      expect(() => new ActionEntity({ ...validProps, coins: 10 })).not.toThrow()
    })
  })

  describe('validate() — scope', () => {
    it('throws when neither affectsClass nor affectsStudent is true', () => {
      expect(() => new ActionEntity({ ...validProps, affectsClass: false, affectsStudent: false }))
        .toThrow('Action must apply to class or student')
    })

    it('accepts actions that only affect the class', () => {
      expect(() => new ActionEntity({ ...validProps, affectsClass: true, affectsStudent: false }))
        .not.toThrow()
    })

    it('accepts actions that only affect the student', () => {
      expect(() => new ActionEntity({ ...validProps, affectsClass: false, affectsStudent: true }))
        .not.toThrow()
    })
  })
})
