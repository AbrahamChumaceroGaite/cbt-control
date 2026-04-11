import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AwardCoinsHandler }  from '../commands/award-coins.handler'
import { AwardCoinsCommand }  from '../commands/award-coins.command'

const fakeLog = {
  id: 'log1', courseId: 'c1', studentId: 's1', actionId: 'a1',
  coins: 10, reason: 'Por participar',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  student: { name: 'Ana' }, action: { name: 'Participación', category: 'Clase' },
  updatedClassCoins: 100, updatedStudentCoins: 60,
}

const mockRepo      = { awardCoins: vi.fn() }
const mockNotify    = { notifyCoinsAwarded: vi.fn().mockResolvedValue(undefined) }
const mockRealtime  = { coinsUpdated: vi.fn() }

let handler: AwardCoinsHandler

beforeEach(() => {
  vi.clearAllMocks()
  handler = new AwardCoinsHandler(mockRepo as never, mockNotify as never, mockRealtime as never)
})

describe('AwardCoinsHandler', () => {
  const dto = { courseId: 'c1', studentId: 's1', actionId: 'a1', coins: 10, reason: 'Por participar' }

  it('calls repo.awardCoins with the dto', async () => {
    mockRepo.awardCoins.mockResolvedValue(fakeLog)
    await handler.execute(new AwardCoinsCommand(dto))
    expect(mockRepo.awardCoins).toHaveBeenCalledWith(dto)
  })

  it('emits real-time coinsUpdated with updated balances', async () => {
    mockRepo.awardCoins.mockResolvedValue(fakeLog)
    await handler.execute(new AwardCoinsCommand(dto))
    expect(mockRealtime.coinsUpdated).toHaveBeenCalledWith({
      courseId:     'c1',
      classCoins:   100,
      studentId:    's1',
      studentCoins: 60,
    })
  })

  it('sends push notification when studentId is present', async () => {
    mockRepo.awardCoins.mockResolvedValue(fakeLog)
    await handler.execute(new AwardCoinsCommand(dto))
    expect(mockNotify.notifyCoinsAwarded).toHaveBeenCalledWith('s1', 10, 'Por participar')
  })

  it('does not send push notification when studentId is absent', async () => {
    const classDto = { courseId: 'c1', coins: 5, reason: 'Clase tranquila' }
    const logNoStudent = { ...fakeLog, studentId: null }
    mockRepo.awardCoins.mockResolvedValue(logNoStudent)
    await handler.execute(new AwardCoinsCommand(classDto))
    expect(mockNotify.notifyCoinsAwarded).not.toHaveBeenCalled()
  })

  it('returns mapped CoinLogResponse', async () => {
    mockRepo.awardCoins.mockResolvedValue(fakeLog)
    const result = await handler.execute(new AwardCoinsCommand(dto))
    expect(result.id).toBe('log1')
    expect(result.coins).toBe(10)
    expect(result.reason).toBe('Por participar')
    expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z')
  })
})
