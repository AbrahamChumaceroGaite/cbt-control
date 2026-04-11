import { vi }                  from 'vitest'
import { CreateCourseHandler } from '../commands/create-course.handler'
import { UpdateCourseHandler } from '../commands/update-course.handler'
import { DeleteCourseHandler } from '../commands/delete-course.handler'
import { CreateCourseCommand } from '../commands/create-course.command'
import { UpdateCourseCommand } from '../commands/update-course.command'
import { DeleteCourseCommand } from '../commands/delete-course.command'
import { CourseEntity }        from '../../domain/course.entity'

const makeEntity = (): CourseEntity => new CourseEntity({
  id: 'c1', name: 'Matemáticas', level: '8vo', parallel: 'A',
  classCoins: 0, createdAt: new Date(), updatedAt: new Date(),
})

const mockRepo = {
  create:   vi.fn(),
  update:   vi.fn(),
  delete:   vi.fn(),
  findAll:  vi.fn(),
  findById: vi.fn(),
}

const dto = { name: 'Matemáticas', level: '8vo', parallel: 'A' }

describe('CreateCourseHandler', () => {
  let handler: CreateCourseHandler
  beforeEach(() => { vi.clearAllMocks(); handler = new CreateCourseHandler(mockRepo as never) })

  it('calls repo.create with the DTO', async () => {
    mockRepo.create.mockResolvedValue(makeEntity())
    await handler.execute(new CreateCourseCommand(dto))
    expect(mockRepo.create).toHaveBeenCalledWith(dto)
  })

  it('returns the mapped CourseResponse', async () => {
    mockRepo.create.mockResolvedValue(makeEntity())
    const result = await handler.execute(new CreateCourseCommand(dto))
    expect(result.id).toBe('c1')
    expect(result.name).toBe('Matemáticas')
  })

  it('propagates repository errors', async () => {
    mockRepo.create.mockRejectedValue(new Error('DB error'))
    await expect(handler.execute(new CreateCourseCommand(dto))).rejects.toThrow('DB error')
  })
})

describe('UpdateCourseHandler', () => {
  let handler: UpdateCourseHandler
  beforeEach(() => { vi.clearAllMocks(); handler = new UpdateCourseHandler(mockRepo as never) })

  it('calls repo.update with the id and DTO', async () => {
    mockRepo.update.mockResolvedValue(makeEntity())
    await handler.execute(new UpdateCourseCommand('c1', dto))
    expect(mockRepo.update).toHaveBeenCalledWith('c1', dto)
  })

  it('returns the mapped CourseResponse', async () => {
    mockRepo.update.mockResolvedValue(makeEntity())
    const result = await handler.execute(new UpdateCourseCommand('c1', dto))
    expect(result.id).toBe('c1')
  })

  it('propagates repository errors', async () => {
    mockRepo.update.mockRejectedValue(new Error('Not found'))
    await expect(handler.execute(new UpdateCourseCommand('bad', dto))).rejects.toThrow('Not found')
  })
})

describe('DeleteCourseHandler', () => {
  let handler: DeleteCourseHandler
  beforeEach(() => { vi.clearAllMocks(); handler = new DeleteCourseHandler(mockRepo as never) })

  it('calls repo.delete with the id', async () => {
    mockRepo.delete.mockResolvedValue(undefined)
    await handler.execute(new DeleteCourseCommand('c1'))
    expect(mockRepo.delete).toHaveBeenCalledWith('c1')
  })

  it('propagates repository errors', async () => {
    mockRepo.delete.mockRejectedValue(new Error('Not found'))
    await expect(handler.execute(new DeleteCourseCommand('bad'))).rejects.toThrow('Not found')
  })
})
