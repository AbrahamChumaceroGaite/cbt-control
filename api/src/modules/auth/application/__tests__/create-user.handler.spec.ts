import { vi }                  from 'vitest'
import { CreateUserHandler }   from '../commands/create-user.handler'
import { CreateUserCommand }   from '../commands/create-user.command'

const mockRepo = { create: vi.fn(), findByCode: vi.fn(), findAll: vi.fn(), update: vi.fn() }
const dto = { code: 'prof@school.edu', password: 'secret123', fullName: 'Profesor García', role: 'TEACHER' as const }

const fakeUser = {
  id:        'u1',
  code:      dto.code,
  fullName:  dto.fullName,
  role:      dto.role,
  isActive:  true,
  studentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler
  beforeEach(() => { vi.clearAllMocks(); handler = new CreateUserHandler(mockRepo as never) })

  it('hashes the password before calling repo.create', async () => {
    mockRepo.create.mockResolvedValue(fakeUser)
    await handler.execute(new CreateUserCommand(dto))
    const callArg = mockRepo.create.mock.calls[0][0]
    expect(callArg.passwordHash).toBeDefined()
    expect(callArg.passwordHash).not.toBe(dto.password)
    expect(callArg.passwordHash.length).toBeGreaterThan(20)
  })

  it('calls repo.create with all DTO fields plus passwordHash', async () => {
    mockRepo.create.mockResolvedValue(fakeUser)
    await handler.execute(new CreateUserCommand(dto))
    const callArg = mockRepo.create.mock.calls[0][0]
    expect(callArg.code).toBe(dto.code)
    expect(callArg.fullName).toBe(dto.fullName)
    expect(callArg.role).toBe(dto.role)
  })

  it('returns the mapped UserResponse', async () => {
    mockRepo.create.mockResolvedValue(fakeUser)
    const result = await handler.execute(new CreateUserCommand(dto))
    expect(result.id).toBe('u1')
    expect(result.name).toBe('Profesor García')
    expect(result.email).toBe('prof@school.edu')
  })

  it('propagates repository errors', async () => {
    mockRepo.create.mockRejectedValue(new Error('Duplicate code'))
    await expect(handler.execute(new CreateUserCommand(dto))).rejects.toThrow('Duplicate code')
  })
})
