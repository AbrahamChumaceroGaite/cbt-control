import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateGameHandler }  from '../commands/create-game.handler'
import { CreateGameCommand }  from '../commands/create-game.command'
import type { GameRepository } from '../../domain/game.repository'
import { GameEntity }         from '../../domain/game.entity'

const fakeEntity = GameEntity.create({
  id:    'g1',
  slug:  'tank-invaders',
  title: 'Tank Invaders',
})

const mockRepo: GameRepository = {
  findAll:    vi.fn(),
  findById:   vi.fn(),
  findBySlug: vi.fn(),
  create:     vi.fn().mockResolvedValue(fakeEntity),
  update:     vi.fn(),
  delete:     vi.fn(),
}

describe('CreateGameHandler', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('calls repo.create and returns mapped response', async () => {
    const handler  = new CreateGameHandler(mockRepo)
    const dto      = { slug: 'tank-invaders', title: 'Tank Invaders' }
    const response = await handler.execute(new CreateGameCommand(dto))

    expect(mockRepo.create).toHaveBeenCalledOnce()
    expect(response.slug).toBe('tank-invaders')
    expect(response.title).toBe('Tank Invaders')
    expect(typeof response.createdAt).toBe('string')
  })

  it('propagates BadRequestException from entity validation', async () => {
    const handler = new CreateGameHandler(mockRepo)
    await expect(
      handler.execute(new CreateGameCommand({ slug: 'x', title: 'T' }))
    ).rejects.toThrow()
  })
})
