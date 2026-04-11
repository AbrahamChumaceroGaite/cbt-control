import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotFoundException }          from '@nestjs/common'
import { RequestRewardHandler }       from '../commands/request-reward.handler'
import { RequestRewardCommand }       from '../commands/request-reward.command'
import { CancelRedemptionHandler }    from '../commands/cancel-redemption.handler'
import { CancelRedemptionCommand }    from '../commands/cancel-redemption.command'
import { UpdateProfileHandler }       from '../commands/update-profile.handler'
import { UpdateProfileCommand }       from '../commands/update-profile.command'
import { GetPortalStudentHandler }    from '../queries/get-portal-student.handler'
import { GetPortalStudentQuery }      from '../queries/get-portal-student.query'
import { GetIndividualRewardsHandler }from '../queries/get-individual-rewards.handler'
import { GetIndividualRewardsQuery }  from '../queries/get-individual-rewards.query'

const fakePortalStudent = {
  id: 's1', name: 'Ana', code: 'A001', coins: 200,
  email: null, courseId: 'c1', avatarUrl: null, bannerUrl: null,
  redemptionRequests: [], coinLogs: [], weeklyHistory: [], nextReward: null,
}
const fakeReward = { id: 'r1', name: 'Libro', icon: '📖', coinsRequired: 100, description: '' }

const mockRepo = {
  requestReward:    vi.fn(),
  cancelRedemption: vi.fn(),
  updateProfile:    vi.fn(),
  getStudentData:   vi.fn(),
  getIndividualRewards: vi.fn(),
}
const mockNotify = {
  notifyAdminsNewRequest: vi.fn().mockResolvedValue(undefined),
}

beforeEach(() => vi.clearAllMocks())

describe('RequestRewardHandler', () => {
  let handler: RequestRewardHandler

  beforeEach(() => { handler = new RequestRewardHandler(mockRepo as never, mockNotify as never) })

  it('calls repo.requestReward and returns the result', async () => {
    mockRepo.requestReward.mockResolvedValue({ id: 'req1', status: 'pending' })
    const cmd = new RequestRewardCommand('s1', { rewardId: 'r1' })

    const result = await handler.execute(cmd)

    expect(mockRepo.requestReward).toHaveBeenCalledWith('s1', 'r1')
    expect(result).toEqual({ id: 'req1', status: 'pending' })
  })

  it('notifies admins as fire-and-forget', async () => {
    mockRepo.requestReward.mockResolvedValue({ id: 'req1', status: 'pending' })
    await handler.execute(new RequestRewardCommand('s1', { rewardId: 'r1' }))
    expect(mockNotify.notifyAdminsNewRequest).toHaveBeenCalledWith('s1', 'r1', 'req1')
  })
})

describe('CancelRedemptionHandler', () => {
  let handler: CancelRedemptionHandler

  beforeEach(() => { handler = new CancelRedemptionHandler(mockRepo as never) })

  it('calls repo.cancelRedemption with studentId and requestId', async () => {
    mockRepo.cancelRedemption.mockResolvedValue(undefined)
    await handler.execute(new CancelRedemptionCommand('s1', 'req1'))
    expect(mockRepo.cancelRedemption).toHaveBeenCalledWith('s1', 'req1')
  })
})

describe('UpdateProfileHandler', () => {
  let handler: UpdateProfileHandler

  beforeEach(() => { handler = new UpdateProfileHandler(mockRepo as never) })

  it('calls repo.updateProfile with userId and urls', async () => {
    mockRepo.updateProfile.mockResolvedValue(undefined)
    const dto = { avatarUrl: 'https://cdn.example.com/a.jpg', bannerUrl: undefined }
    await handler.execute(new UpdateProfileCommand('u1', dto))
    expect(mockRepo.updateProfile).toHaveBeenCalledWith('u1', { avatarUrl: dto.avatarUrl, bannerUrl: undefined })
  })
})

describe('GetPortalStudentHandler', () => {
  let handler: GetPortalStudentHandler

  beforeEach(() => { handler = new GetPortalStudentHandler(mockRepo as never) })

  it('returns portal student data when found', async () => {
    mockRepo.getStudentData.mockResolvedValue(fakePortalStudent)
    const result = await handler.execute(new GetPortalStudentQuery('s1'))
    expect(result.id).toBe('s1')
    expect(result.coins).toBe(200)
  })

  it('throws NotFoundException when student is not found', async () => {
    mockRepo.getStudentData.mockResolvedValue(null)
    await expect(handler.execute(new GetPortalStudentQuery('missing')))
      .rejects.toThrow(NotFoundException)
  })
})

describe('GetIndividualRewardsHandler', () => {
  let handler: GetIndividualRewardsHandler

  beforeEach(() => { handler = new GetIndividualRewardsHandler(mockRepo as never) })

  it('returns list of individual rewards for the student', async () => {
    mockRepo.getIndividualRewards.mockResolvedValue([fakeReward])
    const result = await handler.execute(new GetIndividualRewardsQuery('s1'))
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('r1')
  })
})
