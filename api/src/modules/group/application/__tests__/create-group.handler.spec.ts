import { vi }                  from 'vitest'
import { CreateGroupHandler }  from '../commands/create-group.handler'
import { CreateGroupCommand }  from '../commands/create-group.command'
import { GroupEntity }         from '../../domain/group.entity'

const fakeGroup = new GroupEntity({
  id: 'g1', name: 'Equipo Alpha', courseId: 'c1',
  createdAt: new Date(), updatedAt: new Date(), members: [],
})

const mockRepo = { create: vi.fn(), update: vi.fn(), delete: vi.fn(), findAll: vi.fn() }
const dto = { name: 'Equipo Alpha', courseId: 'c1', studentIds: [] }

describe('CreateGroupHandler', () => {
  let handler: CreateGroupHandler
  beforeEach(() => { vi.clearAllMocks(); handler = new CreateGroupHandler(mockRepo as never) })

  it('calls repo.create with the DTO', async () => {
    mockRepo.create.mockResolvedValue(fakeGroup)
    await handler.execute(new CreateGroupCommand(dto))
    expect(mockRepo.create).toHaveBeenCalledWith(dto)
  })

  it('returns the mapped GroupResponse', async () => {
    mockRepo.create.mockResolvedValue(fakeGroup)
    const result = await handler.execute(new CreateGroupCommand(dto))
    expect(result.id).toBe('g1')
    expect(result.name).toBe('Equipo Alpha')
  })

  it('propagates repository errors', async () => {
    mockRepo.create.mockRejectedValue(new Error('DB error'))
    await expect(handler.execute(new CreateGroupCommand(dto))).rejects.toThrow('DB error')
  })
})
