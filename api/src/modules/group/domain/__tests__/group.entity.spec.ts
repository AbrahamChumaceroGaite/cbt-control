import { GroupEntity } from '../group.entity'

const validProps = {
  id:        'g1',
  name:      'Equipo Alpha',
  courseId:  'c1',
  createdAt: new Date(),
  updatedAt: new Date(),
  members:   [],
}

describe('GroupEntity', () => {
  describe('constructor — valid data', () => {
    it('creates an entity with all valid props', () => {
      const entity = new GroupEntity(validProps)
      expect(entity.id).toBe('g1')
      expect(entity.name).toBe('Equipo Alpha')
      expect(entity.courseId).toBe('c1')
    })
  })

  describe('validate() — name', () => {
    it('throws when name is empty', () => {
      expect(() => new GroupEntity({ ...validProps, name: '' }))
        .toThrow('El nombre del grupo debe tener al menos 2 caracteres')
    })

    it('throws when name has only one character', () => {
      expect(() => new GroupEntity({ ...validProps, name: 'X' }))
        .toThrow('El nombre del grupo debe tener al menos 2 caracteres')
    })

    it('throws when name is only whitespace', () => {
      expect(() => new GroupEntity({ ...validProps, name: '  ' }))
        .toThrow('El nombre del grupo debe tener al menos 2 caracteres')
    })

    it('accepts name with exactly 2 characters', () => {
      expect(() => new GroupEntity({ ...validProps, name: 'AB' })).not.toThrow()
    })
  })

  describe('validate() — courseId', () => {
    it('throws when courseId is empty', () => {
      expect(() => new GroupEntity({ ...validProps, courseId: '' }))
        .toThrow('El curso del grupo es requerido')
    })

    it('throws when courseId is only whitespace', () => {
      expect(() => new GroupEntity({ ...validProps, courseId: '   ' }))
        .toThrow('El curso del grupo es requerido')
    })
  })
})
