import { vi }                   from 'vitest'
import { CreateStudentHandler }  from '../commands/create-student.handler'
import { CreateStudentCommand }  from '../commands/create-student.command'
import { StudentEntity }         from '../../domain/student.entity'

const fakeStudent = new StudentEntity({
  id: 's1', courseId: 'c1', code: 'EST001', name: 'Ana García',
  email: null, coins: 0, createdAt: new Date(), tramos: [],
})

const mockRepo = { create: vi.fn(), update: vi.fn(), delete: vi.fn(), findAll: vi.fn(), createMany: vi.fn() }
const dto = { courseId: 'c1', code: 'EST001', name: 'Ana García', email: null }

describe('CreateStudentHandler', () => {
  let handler: CreateStudentHandler
  beforeEach(() => { vi.clearAllMocks(); handler = new CreateStudentHandler(mockRepo as never) })

  it('calls repo.create with the DTO', async () => {
    mockRepo.create.mockResolvedValue(fakeStudent)
    await handler.execute(new CreateStudentCommand(dto))
    expect(mockRepo.create).toHaveBeenCalledWith(dto)
  })

  it('returns the mapped StudentResponse', async () => {
    mockRepo.create.mockResolvedValue(fakeStudent)
    const result = await handler.execute(new CreateStudentCommand(dto))
    expect(result.id).toBe('s1')
    expect(result.name).toBe('Ana García')
  })

  it('propagates repository errors', async () => {
    mockRepo.create.mockRejectedValue(new Error('Duplicate code'))
    await expect(handler.execute(new CreateStudentCommand(dto))).rejects.toThrow('Duplicate code')
  })
})
