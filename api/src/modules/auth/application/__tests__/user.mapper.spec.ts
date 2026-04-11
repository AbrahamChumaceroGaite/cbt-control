import { UserMapper } from '../user.mapper'

const fakeUser = {
  id:       'u1',
  code:     'prof@school.edu',
  fullName: 'Profesor García',
  role:     'TEACHER' as const,
  isActive: true,
  studentId:  null,
  createdAt:  new Date(),
  updatedAt:  new Date(),
}

describe('UserMapper', () => {
  describe('toResponse()', () => {
    it('maps all public fields', () => {
      const result = UserMapper.toResponse(fakeUser)
      expect(result.id).toBe('u1')
      expect(result.name).toBe('Profesor García')
      expect(result.email).toBe('prof@school.edu')
      expect(result.role).toBe('TEACHER')
      expect(result.isActive).toBe(true)
    })

    it('does not expose passwordHash', () => {
      const result = UserMapper.toResponse(fakeUser)
      expect(result).not.toHaveProperty('passwordHash')
    })

    it('maps code as email field', () => {
      const result = UserMapper.toResponse({ ...fakeUser, code: 'admin@school.edu' })
      expect(result.email).toBe('admin@school.edu')
    })

    it('maps fullName as name field', () => {
      const result = UserMapper.toResponse({ ...fakeUser, fullName: 'María López' })
      expect(result.name).toBe('María López')
    })
  })
})
