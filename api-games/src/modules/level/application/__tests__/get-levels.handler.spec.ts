import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetLevelsHandler } from '../queries/get-levels.handler'
import { GetLevelsQuery }   from '../queries/get-levels.query'
import { LevelEntity }      from '../../domain/level.entity'
import type { LevelRepository } from '../../domain/level.repository'

function makeLevel(number: number): LevelEntity {
  return LevelEntity.fromRecord({
    id:             `lv${number}`,
    gameId:         'g1',
    number,
    speedMult:      1.0,
    fireRateMult:   1.0,
    enemyColsCount: 8,
    enemyRowsCount: 4,
    bunkerCount:    4,
    hasMysteryTank: false,
    specialEvent:   'none',
    isBoss:         false,
    bossHits:       1,
    enemyMixLight:  60,
    enemyMixMedium: 30,
    enemyMixHeavy:  10,
  })
}

const mockRepo: LevelRepository = {
  findByGame:   vi.fn().mockResolvedValue([makeLevel(1), makeLevel(2), makeLevel(3)]),
  findByNumber: vi.fn(),
}

describe('GetLevelsHandler', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns mapped level responses for a game', async () => {
    const handler  = new GetLevelsHandler(mockRepo)
    const results  = await handler.execute(new GetLevelsQuery('g1'))

    expect(mockRepo.findByGame).toHaveBeenCalledWith('g1')
    expect(results).toHaveLength(3)
    expect(results[0].number).toBe(1)
    expect(results[1].number).toBe(2)
    expect(results[2].number).toBe(3)
    expect(results[0].config.speedMult).toBe(1.0)
  })

  it('returns empty array when game has no levels', async () => {
    vi.mocked(mockRepo.findByGame).mockResolvedValueOnce([])
    const handler = new GetLevelsHandler(mockRepo)
    const results = await handler.execute(new GetLevelsQuery('g-empty'))
    expect(results).toHaveLength(0)
  })
})
