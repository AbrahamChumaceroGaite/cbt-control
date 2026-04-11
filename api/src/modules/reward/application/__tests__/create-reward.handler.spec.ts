import { vi }                   from 'vitest'
import { CreateRewardHandler }  from '../commands/create-reward.handler'
import { CreateRewardCommand }  from '../commands/create-reward.command'
import { RewardEntity }         from '../../domain/reward.entity'

const fakeReward = new RewardEntity({
  id: 'r1', name: 'Punto Extra', description: 'Desc', icon: '⭐',
  coinsRequired: 50, discount: 0, discountEndsAt: null,
  type: 'individual', isGlobal: false, isActive: true,
  createdAt: new Date(), updatedAt: new Date(),
})

const mockRepo = { create: vi.fn(), update: vi.fn(), delete: vi.fn(), findAll: vi.fn() }
const dto = { name: 'Punto Extra', description: 'Desc', icon: '⭐', coinsRequired: 50, discount: 0, type: 'individual', isGlobal: false }

describe('CreateRewardHandler', () => {
  let handler: CreateRewardHandler
  beforeEach(() => { vi.clearAllMocks(); handler = new CreateRewardHandler(mockRepo as never) })

  it('calls repo.create with the DTO', async () => {
    mockRepo.create.mockResolvedValue(fakeReward)
    await handler.execute(new CreateRewardCommand(dto))
    expect(mockRepo.create).toHaveBeenCalledWith(dto)
  })

  it('returns the mapped RewardResponse', async () => {
    mockRepo.create.mockResolvedValue(fakeReward)
    const result = await handler.execute(new CreateRewardCommand(dto))
    expect(result.id).toBe('r1')
    expect(result.name).toBe('Punto Extra')
    expect(result.coinsRequired).toBe(50)
  })

  it('propagates repository errors', async () => {
    mockRepo.create.mockRejectedValue(new Error('DB error'))
    await expect(handler.execute(new CreateRewardCommand(dto))).rejects.toThrow('DB error')
  })
})
