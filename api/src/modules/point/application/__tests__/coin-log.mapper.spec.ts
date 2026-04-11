import { CoinLogMapper } from '../coin-log.mapper'

const now = new Date('2024-01-15T10:00:00Z')

const fakeEntity = {
  id:                  'cl1',
  courseId:            'c1',
  studentId:           's1',
  actionId:            'a1',
  coins:               5,
  reason:              'Participación en clase',
  createdAt:           now,
  student:             { id: 's1', name: 'Ana García' },
  action:              { id: 'a1', name: 'Participación', category: 'blue' },
  updatedClassCoins:   200,
  updatedStudentCoins: 105,
}

describe('CoinLogMapper', () => {
  describe('toResponse()', () => {
    it('maps all required fields', () => {
      const result = CoinLogMapper.toResponse(fakeEntity)
      expect(result.id).toBe('cl1')
      expect(result.coins).toBe(5)
      expect(result.reason).toBe('Participación en clase')
      expect(result.student).toEqual({ id: 's1', name: 'Ana García' })
      expect(result.action).toEqual({ id: 'a1', name: 'Participación', category: 'blue' })
    })

    it('converts Date createdAt to ISO string', () => {
      const result = CoinLogMapper.toResponse(fakeEntity)
      expect(result.createdAt).toBe('2024-01-15T10:00:00.000Z')
    })

    it('passes through string createdAt unchanged', () => {
      const result = CoinLogMapper.toResponse({ ...fakeEntity, createdAt: '2024-01-15T10:00:00.000Z' as never })
      expect(result.createdAt).toBe('2024-01-15T10:00:00.000Z')
    })

    it('does not expose internal coin totals', () => {
      const result = CoinLogMapper.toResponse(fakeEntity)
      expect(result).not.toHaveProperty('updatedClassCoins')
      expect(result).not.toHaveProperty('updatedStudentCoins')
      expect(result).not.toHaveProperty('courseId')
      expect(result).not.toHaveProperty('studentId')
      expect(result).not.toHaveProperty('actionId')
    })
  })
})
