import { vi }                  from 'vitest'
import { DeleteActionHandler } from '../commands/delete-action.handler'
import { DeleteActionCommand } from '../commands/delete-action.command'

const mockRepo = { create: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn() }

describe('DeleteActionHandler', () => {
  let handler: DeleteActionHandler

  beforeEach(() => {
    vi.clearAllMocks()
    handler = new DeleteActionHandler(mockRepo as never)
  })

  it('calls repo.delete with the id from the command', async () => {
    mockRepo.delete.mockResolvedValue(undefined)
    await handler.execute(new DeleteActionCommand('a1'))
    expect(mockRepo.delete).toHaveBeenCalledWith('a1')
  })

  it('propagates repository errors', async () => {
    mockRepo.delete.mockRejectedValue(new Error('Not found'))
    await expect(handler.execute(new DeleteActionCommand('bad-id'))).rejects.toThrow('Not found')
  })
})
