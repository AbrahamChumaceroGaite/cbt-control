import { vi }                  from 'vitest'
import { UpdateActionHandler } from '../commands/update-action.handler'
import { UpdateActionCommand } from '../commands/update-action.command'
import { ActionEntity }        from '../../domain/action.entity'

const fakeEntity: ActionEntity = new ActionEntity({
  id:             'a1',
  name:           'Participación editada',
  coins:          5,
  category:       'green',
  affectsClass:   true,
  affectsStudent: false,
  isActive:       true,
  createdAt:      new Date(),
  updatedAt:      new Date(),
})

const mockRepo = { create: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn() }

describe('UpdateActionHandler', () => {
  let handler: UpdateActionHandler

  beforeEach(() => {
    vi.clearAllMocks()
    handler = new UpdateActionHandler(mockRepo as never)
  })

  it('calls repo.update with the id and DTO from the command', async () => {
    mockRepo.update.mockResolvedValue(fakeEntity)
    const dto = { name: 'Participación editada', coins: 5, category: 'green', affectsClass: true, affectsStudent: false, isActive: true }
    await handler.execute(new UpdateActionCommand('a1', dto))
    expect(mockRepo.update).toHaveBeenCalledWith('a1', dto)
  })

  it('returns the mapped ActionResponse', async () => {
    mockRepo.update.mockResolvedValue(fakeEntity)
    const dto = { name: 'Participación editada', coins: 5, category: 'green', affectsClass: true, affectsStudent: false, isActive: true }
    const result = await handler.execute(new UpdateActionCommand('a1', dto))
    expect(result.id).toBe('a1')
    expect(result.name).toBe('Participación editada')
    expect(result.coins).toBe(5)
  })

  it('propagates repository errors', async () => {
    mockRepo.update.mockRejectedValue(new Error('Not found'))
    const dto = { name: 'Test', coins: 1, category: 'blue', affectsClass: true, affectsStudent: false, isActive: true }
    await expect(handler.execute(new UpdateActionCommand('bad-id', dto))).rejects.toThrow('Not found')
  })
})
