import { CourseMapper }  from '../course.mapper'
import { CourseEntity }  from '../../domain/course.entity'

const makeEntity = (overrides?: Partial<ConstructorParameters<typeof CourseEntity>[0]>): CourseEntity =>
  new CourseEntity({
    id:         'c1',
    name:       'Matemáticas',
    level:      '8vo',
    parallel:   'A',
    classCoins: 150,
    createdAt:  new Date(),
    updatedAt:  new Date(),
    _count:     { students: 30 },
    ...overrides,
  })

describe('CourseMapper', () => {
  describe('toResponse()', () => {
    it('maps all fields from entity to response DTO', () => {
      const entity = makeEntity()
      const result = CourseMapper.toResponse(entity)
      expect(result.id).toBe('c1')
      expect(result.name).toBe('Matemáticas')
      expect(result.level).toBe('8vo')
      expect(result.parallel).toBe('A')
      expect(result.classCoins).toBe(150)
      expect(result.studentCount).toBe(30)
    })

    it('returns undefined studentCount when _count is absent', () => {
      const entity = makeEntity({ _count: undefined })
      const result = CourseMapper.toResponse(entity)
      expect(result.studentCount).toBeUndefined()
    })

    it('does not expose createdAt or updatedAt', () => {
      const entity = makeEntity()
      const result = CourseMapper.toResponse(entity)
      expect(result).not.toHaveProperty('createdAt')
      expect(result).not.toHaveProperty('updatedAt')
    })
  })
})
