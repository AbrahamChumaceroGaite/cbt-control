import { CourseEntity } from '../course.entity'

const validProps = {
  id:         'c1',
  name:       'Matemáticas',
  level:      '8vo',
  parallel:   'A',
  classCoins: 0,
  createdAt:  new Date(),
  updatedAt:  new Date(),
}

describe('CourseEntity', () => {
  describe('constructor — valid data', () => {
    it('creates an entity with all valid props', () => {
      const entity = new CourseEntity(validProps)
      expect(entity.id).toBe('c1')
      expect(entity.name).toBe('Matemáticas')
      expect(entity.level).toBe('8vo')
      expect(entity.parallel).toBe('A')
    })
  })

  describe('validate() — name', () => {
    it('throws when name is empty', () => {
      expect(() => new CourseEntity({ ...validProps, name: '' }))
        .toThrow('Course name must be at least 2 characters')
    })

    it('throws when name has only one character', () => {
      expect(() => new CourseEntity({ ...validProps, name: 'X' }))
        .toThrow('Course name must be at least 2 characters')
    })

    it('throws when name is only whitespace', () => {
      expect(() => new CourseEntity({ ...validProps, name: '  ' }))
        .toThrow('Course name must be at least 2 characters')
    })

    it('accepts name with exactly 2 characters', () => {
      expect(() => new CourseEntity({ ...validProps, name: 'Ar' })).not.toThrow()
    })
  })

  describe('validate() — level', () => {
    it('throws when level is empty', () => {
      expect(() => new CourseEntity({ ...validProps, level: '' }))
        .toThrow('Course level is required')
    })

    it('throws when level is only whitespace', () => {
      expect(() => new CourseEntity({ ...validProps, level: '  ' }))
        .toThrow('Course level is required')
    })
  })

  describe('validate() — parallel', () => {
    it('throws when parallel is empty', () => {
      expect(() => new CourseEntity({ ...validProps, parallel: '' }))
        .toThrow('Course parallel is required')
    })

    it('throws when parallel is only whitespace', () => {
      expect(() => new CourseEntity({ ...validProps, parallel: '   ' }))
        .toThrow('Course parallel is required')
    })
  })
})
