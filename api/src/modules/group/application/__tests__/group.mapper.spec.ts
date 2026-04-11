import { GroupMapper }  from '../group.mapper'
import { GroupEntity }  from '../../domain/group.entity'

const makeEntity = (): GroupEntity => new GroupEntity({
  id:        'g1',
  name:      'Equipo Alpha',
  courseId:  'c1',
  createdAt: new Date(),
  updatedAt: new Date(),
  members: [{
    id:        'm1',
    studentId: 's1',
    student:   { id: 's1', name: 'Ana García', coins: 100 },
  }],
})

describe('GroupMapper', () => {
  describe('toResponse()', () => {
    it('maps all fields from entity to response DTO', () => {
      const result = GroupMapper.toResponse(makeEntity())
      expect(result.id).toBe('g1')
      expect(result.name).toBe('Equipo Alpha')
      expect(result.courseId).toBe('c1')
      expect(result.members).toHaveLength(1)
      expect(result.members[0].student.name).toBe('Ana García')
    })

    it('does not expose createdAt or updatedAt', () => {
      const result = GroupMapper.toResponse(makeEntity())
      expect(result).not.toHaveProperty('createdAt')
      expect(result).not.toHaveProperty('updatedAt')
    })

    it('maps empty members array', () => {
      const entity = new GroupEntity({
        id: 'g2', name: 'Sin miembros', courseId: 'c1',
        createdAt: new Date(), updatedAt: new Date(), members: [],
      })
      const result = GroupMapper.toResponse(entity)
      expect(result.members).toEqual([])
    })
  })
})
