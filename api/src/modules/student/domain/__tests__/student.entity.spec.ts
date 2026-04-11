import { StudentEntity } from '../student.entity'

const validProps = {
  id:        's1',
  courseId:  'c1',
  code:      'EST001',
  name:      'Ana García',
  email:     'ana@school.edu',
  coins:     100,
  createdAt: new Date(),
  tramos:    [],
}

describe('StudentEntity', () => {
  describe('constructor — valid data', () => {
    it('creates an entity with all valid props', () => {
      const entity = new StudentEntity(validProps)
      expect(entity.id).toBe('s1')
      expect(entity.name).toBe('Ana García')
      expect(entity.coins).toBe(100)
    })
  })

  describe('validate() — name', () => {
    it('throws when name is empty', () => {
      expect(() => new StudentEntity({ ...validProps, name: '' }))
        .toThrow('El nombre del estudiante es requerido')
    })

    it('throws when name is only whitespace', () => {
      expect(() => new StudentEntity({ ...validProps, name: '   ' }))
        .toThrow('El nombre del estudiante es requerido')
    })

    it('accepts a valid name', () => {
      expect(() => new StudentEntity({ ...validProps, name: 'Pedro' })).not.toThrow()
    })
  })

  describe('validate() — courseId', () => {
    it('throws when courseId is empty', () => {
      expect(() => new StudentEntity({ ...validProps, courseId: '' }))
        .toThrow('El curso del estudiante es requerido')
    })

    it('throws when courseId is only whitespace', () => {
      expect(() => new StudentEntity({ ...validProps, courseId: '  ' }))
        .toThrow('El curso del estudiante es requerido')
    })
  })

  describe('validate() — coins', () => {
    it('throws when coins is negative', () => {
      expect(() => new StudentEntity({ ...validProps, coins: -1 }))
        .toThrow('Los coins del estudiante no pueden ser negativos')
    })

    it('accepts zero coins', () => {
      expect(() => new StudentEntity({ ...validProps, coins: 0 })).not.toThrow()
    })

    it('accepts positive coins', () => {
      expect(() => new StudentEntity({ ...validProps, coins: 500 })).not.toThrow()
    })
  })
})
