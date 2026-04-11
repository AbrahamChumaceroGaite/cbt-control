import { ActionMapper }  from '../action.mapper'
import { ActionEntity }  from '../../domain/action.entity'

const makeEntity = (overrides: Partial<ConstructorParameters<typeof ActionEntity>[0]> = {}): ActionEntity =>
  new ActionEntity({
    id:             'a1',
    name:           'Participación',
    coins:          3,
    category:       'blue',
    affectsClass:   true,
    affectsStudent: true,
    isActive:       true,
    createdAt:      new Date('2024-01-01'),
    updatedAt:      new Date('2024-01-01'),
    ...overrides,
  })

describe('ActionMapper', () => {
  describe('toResponse()', () => {
    it('maps all fields from entity to response DTO', () => {
      const entity   = makeEntity()
      const response = ActionMapper.toResponse(entity)

      expect(response.id).toBe('a1')
      expect(response.name).toBe('Participación')
      expect(response.coins).toBe(3)
      expect(response.category).toBe('blue')
      expect(response.affectsClass).toBe(true)
      expect(response.affectsStudent).toBe(true)
      expect(response.isActive).toBe(true)
    })

    it('does not expose internal fields (createdAt, updatedAt)', () => {
      const entity   = makeEntity()
      const response = ActionMapper.toResponse(entity) as Record<string, unknown>

      expect(response['createdAt']).toBeUndefined()
      expect(response['updatedAt']).toBeUndefined()
    })

    it('correctly maps an inactive action', () => {
      const entity   = makeEntity({ isActive: false })
      const response = ActionMapper.toResponse(entity)
      expect(response.isActive).toBe(false)
    })

    it('correctly maps negative coins (penalty action)', () => {
      const entity   = makeEntity({ coins: -5 })
      const response = ActionMapper.toResponse(entity)
      expect(response.coins).toBe(-5)
    })
  })
})
