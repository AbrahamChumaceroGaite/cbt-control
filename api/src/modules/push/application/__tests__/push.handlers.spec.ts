import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SubscribeHandler }   from '../commands/subscribe.handler'
import { SubscribeCommand }   from '../commands/subscribe.command'
import { UnsubscribeHandler } from '../commands/unsubscribe.handler'
import { UnsubscribeCommand } from '../commands/unsubscribe.command'

const mockRepo = {
  upsert:            vi.fn(),
  removeByEndpoint:  vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('SubscribeHandler', () => {
  let handler: SubscribeHandler

  beforeEach(() => { handler = new SubscribeHandler(mockRepo as never) })

  it('calls repo.upsert with userId and subscription keys', async () => {
    mockRepo.upsert.mockResolvedValue(undefined)
    const dto = { endpoint: 'https://fcm.example.com/push', keys: { p256dh: 'key1', auth: 'auth1' } }
    const cmd = new SubscribeCommand('u1', dto)

    await handler.execute(cmd)

    expect(mockRepo.upsert).toHaveBeenCalledWith('u1', dto.endpoint, dto.keys.p256dh, dto.keys.auth)
  })

  it('propagates repository errors', async () => {
    mockRepo.upsert.mockRejectedValue(new Error('DB error'))
    const dto = { endpoint: 'https://fcm.example.com/push', keys: { p256dh: 'k', auth: 'a' } }
    await expect(handler.execute(new SubscribeCommand('u1', dto))).rejects.toThrow('DB error')
  })
})

describe('UnsubscribeHandler', () => {
  let handler: UnsubscribeHandler

  beforeEach(() => { handler = new UnsubscribeHandler(mockRepo as never) })

  it('calls repo.removeByEndpoint with the endpoint', async () => {
    mockRepo.removeByEndpoint.mockResolvedValue(undefined)
    await handler.execute(new UnsubscribeCommand('https://fcm.example.com/push'))
    expect(mockRepo.removeByEndpoint).toHaveBeenCalledWith('https://fcm.example.com/push')
  })

  it('propagates repository errors', async () => {
    mockRepo.removeByEndpoint.mockRejectedValue(new Error('Not found'))
    await expect(handler.execute(new UnsubscribeCommand('bad-endpoint'))).rejects.toThrow('Not found')
  })
})
