import { vi }                  from 'vitest'
import { CreateActionHandler } from '../commands/create-action.handler'
import { CreateActionCommand } from '../commands/create-action.command'
import { ActionEntity }        from '../../domain/action.entity'

const fakeEntity: ActionEntity = new ActionEntity({
  id:             'a1',
  name:           'Participación',
  coins:          3,
  category:       'blue',
  affectsClass:   true,
  affectsStudent: true,
  isActive:       true,
  createdAt:      new Date(),
  updatedAt:      new Date(),
})

const mockRepo = { create: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn() }

describe('CreateActionHandler', () => {
  let handler: CreateActionHandler

  beforeEach(() => {
    vi.clearAllMocks()
    handler = new CreateActionHandler(mockRepo as never)
  })

  it('calls repo.create with the DTO from the command', async () => {
    mockRepo.create.mockResolvedValue(fakeEntity)
    const dto = { name: 'Participación', coins: 3, category: 'blue', affectsClass: true, affectsStudent: true, isActive: true }
    await handler.execute(new CreateActionCommand(dto))
    expect(mockRepo.create).toHaveBeenCalledWith(dto)
  })

  it('returns the mapped ActionResponse', async () => {
    mockRepo.create.mockResolvedValue(fakeEntity)
    const dto = { name: 'Participación', coins: 3, category: 'blue', affectsClass: true, affectsStudent: true, isActive: true }
    const result = await handler.execute(new CreateActionCommand(dto))
    expect(result.id).toBe('a1')
    expect(result.name).toBe('Participación')
    expect(result.coins).toBe(3)
  })

  it('propagates repository errors', async () => {
    mockRepo.create.mockRejectedValue(new Error('DB error'))
    const dto = { name: 'Test', coins: 1, category: 'blue', affectsClass: true, affectsStudent: false, isActive: true }
    await expect(handler.execute(new CreateActionCommand(dto))).rejects.toThrow('DB error')
  })
})
