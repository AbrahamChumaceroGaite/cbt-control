import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetInboxHandler }   from '../queries/get-inbox.handler'
import { GetInboxQuery }     from '../queries/get-inbox.query'
import { MarkReadHandler }   from '../commands/mark-read.handler'
import { MarkReadCommand }   from '../commands/mark-read.command'
import { BatchInboxHandler } from '../commands/batch-inbox.handler'
import { BatchInboxCommand } from '../commands/batch-inbox.command'

const fakeNotif = {
  id: 'n1', userId: 'u1', title: 'Test', body: '', url: '', tag: '',
  isRead: false, createdAt: new Date('2024-01-01T00:00:00.000Z'),
}

const mockRepo = {
  findByUser:   vi.fn(),
  countUnread:  vi.fn(),
  markRead:     vi.fn(),
  markAllRead:  vi.fn(),
  deleteAll:    vi.fn(),
  deleteMany:   vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('GetInboxHandler', () => {
  let handler: GetInboxHandler

  beforeEach(() => { handler = new GetInboxHandler(mockRepo as never) })

  it('returns items and unread count', async () => {
    mockRepo.findByUser.mockResolvedValue([fakeNotif])
    mockRepo.countUnread.mockResolvedValue(1)

    const result = await handler.execute(new GetInboxQuery('u1'))

    expect(result.items).toHaveLength(1)
    expect(result.unreadCount).toBe(1)
    expect(result.items[0].id).toBe('n1')
    expect(result.items[0].createdAt).toBe('2024-01-01T00:00:00.000Z')
  })

  it('fetches findByUser and countUnread in parallel', async () => {
    mockRepo.findByUser.mockResolvedValue([])
    mockRepo.countUnread.mockResolvedValue(0)

    await handler.execute(new GetInboxQuery('u1'))

    expect(mockRepo.findByUser).toHaveBeenCalledWith('u1', 50)
    expect(mockRepo.countUnread).toHaveBeenCalledWith('u1')
  })
})

describe('MarkReadHandler', () => {
  let handler: MarkReadHandler

  beforeEach(() => { handler = new MarkReadHandler(mockRepo as never) })

  it('calls repo.markRead with id and userId', async () => {
    mockRepo.markRead.mockResolvedValue(undefined)

    await handler.execute(new MarkReadCommand('n1', 'u1'))

    expect(mockRepo.markRead).toHaveBeenCalledWith('n1', 'u1')
  })
})

describe('BatchInboxHandler', () => {
  let handler: BatchInboxHandler

  beforeEach(() => { handler = new BatchInboxHandler(mockRepo as never) })

  it('calls markAllRead when action is mark-all-read', async () => {
    mockRepo.markAllRead.mockResolvedValue(undefined)
    await handler.execute(new BatchInboxCommand('u1', { action: 'mark-all-read' }))
    expect(mockRepo.markAllRead).toHaveBeenCalledWith('u1')
  })

  it('calls deleteAll when action is delete-all', async () => {
    mockRepo.deleteAll.mockResolvedValue(undefined)
    await handler.execute(new BatchInboxCommand('u1', { action: 'delete-all' }))
    expect(mockRepo.deleteAll).toHaveBeenCalledWith('u1')
  })

  it('calls deleteMany with ids when action is delete-many', async () => {
    mockRepo.deleteMany.mockResolvedValue(undefined)
    await handler.execute(new BatchInboxCommand('u1', { action: 'delete-many', ids: ['n1', 'n2'] }))
    expect(mockRepo.deleteMany).toHaveBeenCalledWith(['n1', 'n2'], 'u1')
  })

  it('calls deleteMany with empty array when ids is not provided', async () => {
    mockRepo.deleteMany.mockResolvedValue(undefined)
    await handler.execute(new BatchInboxCommand('u1', { action: 'delete-many' }))
    expect(mockRepo.deleteMany).toHaveBeenCalledWith([], 'u1')
  })
})
