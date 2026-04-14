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
        .toThrow('Group name must be at least 2 characters')
    })

    it('throws when name has only one character', () => {
      expect(() => new GroupEntity({ ...validProps, name: 'X' }))
        .toThrow('Group name must be at least 2 characters')
    })

    it('throws when name is only whitespace', () => {
      expect(() => new GroupEntity({ ...validProps, name: '  ' }))
        .toThrow('Group name must be at least 2 characters')
    })

    it('accepts name with exactly 2 characters', () => {
      expect(() => new GroupEntity({ ...validProps, name: 'AB' })).not.toThrow()
    })
  })

  describe('validate() — courseId', () => {
    it('throws when courseId is empty', () => {
      expect(() => new GroupEntity({ ...validProps, courseId: '' }))
        .toThrow('Group course is required')
    })

    it('throws when courseId is only whitespace', () => {
      expect(() => new GroupEntity({ ...validProps, courseId: '   ' }))
        .toThrow('Group course is required')
    })
  })
})
