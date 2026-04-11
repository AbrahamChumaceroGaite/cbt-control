import { vi }               from 'vitest'
import { GetActionsHandler } from '../queries/get-actions.handler'
import { GetActionsQuery }   from '../queries/get-actions.query'
import { ActionEntity }      from '../../domain/action.entity'

const makeEntity = (id: string, name: string): ActionEntity =>
  new ActionEntity({
    id, name, coins: 3, category: 'blue',
    affectsClass: true, affectsStudent: true, isActive: true,
    createdAt: new Date(), updatedAt: new Date(),
  })

const mockRepo = { create: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn() }

describe('GetActionsHandler', () => {
  let handler: GetActionsHandler

  beforeEach(() => {
    vi.clearAllMocks()
    handler = new GetActionsHandler(mockRepo as never)
  })

  it('returns an empty array when no actions exist', async () => {
    mockRepo.findAll.mockResolvedValue([])
    const result = await handler.execute(new GetActionsQuery())
    expect(result).toEqual([])
  })

  it('returns all actions mapped to ActionResponse', async () => {
    mockRepo.findAll.mockResolvedValue([
      makeEntity('a1', 'Participación'),
      makeEntity('a2', 'Tarea'),
    ])
    const result = await handler.execute(new GetActionsQuery())
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('a1')
    expect(result[1].id).toBe('a2')
  })

  it('propagates repository errors', async () => {
    mockRepo.findAll.mockRejectedValue(new Error('DB error'))
    await expect(handler.execute(new GetActionsQuery())).rejects.toThrow('DB error')
  })
})
