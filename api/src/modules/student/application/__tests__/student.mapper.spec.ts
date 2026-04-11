import { StudentMapper }  from '../student.mapper'
import { StudentEntity }  from '../../domain/student.entity'

const makeEntity = (coins = 100): StudentEntity => new StudentEntity({
  id:        's1',
  courseId:  'c1',
  code:      'EST001',
  name:      'Ana García',
  email:     'ana@school.edu',
  coins,
  createdAt: new Date(),
  tramos:    [{ tramo: 'bronce', awardedAt: new Date() }],
  course:    { name: 'Matemáticas', classCoins: 200 },
})

describe('StudentMapper', () => {
  describe('toResponse()', () => {
    it('maps all required fields', () => {
      const result = StudentMapper.toResponse(makeEntity())
      expect(result.id).toBe('s1')
      expect(result.courseId).toBe('c1')
      expect(result.name).toBe('Ana García')
      expect(result.code).toBe('EST001')
      expect(result.email).toBe('ana@school.edu')
      expect(result.coins).toBe(100)
    })

    it('maps tramos stripping awardedAt', () => {
      const result = StudentMapper.toResponse(makeEntity())
      expect(result.tramos).toEqual([{ tramo: 'bronce' }])
      expect(result.tramos[0]).not.toHaveProperty('awardedAt')
    })

    it('includes course data when present', () => {
      const result = StudentMapper.toResponse(makeEntity())
      expect(result.course).toEqual({ name: 'Matemáticas', classCoins: 200 })
    })

    it('handles null email', () => {
      const entity = new StudentEntity({
        id: 's2', courseId: 'c1', code: 'EST002', name: 'Juan',
        email: null, coins: 0, createdAt: new Date(), tramos: [],
      })
      const result = StudentMapper.toResponse(entity)
      expect(result.email).toBeNull()
    })
  })
})
