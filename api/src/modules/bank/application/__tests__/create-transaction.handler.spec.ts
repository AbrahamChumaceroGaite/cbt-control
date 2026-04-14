import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { CreateTransactionHandler } from '../commands/create-transaction.handler'
import { CreateTransactionCommand } from '../commands/create-transaction.command'

const fakeFullTx = {
  id:          'tx1',
  fromStudent: { id: 's1', name: 'Ana',   course: { name: 'Matemáticas' } },
  toStudent:   { id: 's2', name: 'Pedro', course: { name: 'Ciencias' } },
  amount: 50, tax: 1, status: 'pending', notes: 'Regalo', adminNotes: '',
  createdAt: new Date(),
}

const mockRepo = {
  countWeekly: vi.fn(),
}
const mockPrisma = {
  student:         { findUnique: vi.fn(), update: vi.fn() },
  coinTransaction: { create: vi.fn(), findUnique: vi.fn() },
  coinLog:         { create: vi.fn() },
  $transaction:    vi.fn(),
}
const mockNotify = {
  notifyAdminsNewTransaction: vi.fn().mockResolvedValue(undefined),
}
const mockLog = {
  module: vi.fn(),
}

let handler: CreateTransactionHandler

beforeEach(() => {
  vi.clearAllMocks()
  handler = new CreateTransactionHandler(mockRepo as never, mockPrisma as never, mockNotify as never, mockLog as never)
})

describe('CreateTransactionHandler', () => {
  const dto    = { toStudentId: 's2', amount: 50, notes: 'Regalo' }
  const cmd    = new CreateTransactionCommand('s1', dto)

  it('throws BadRequestException when sender === recipient', async () => {
    const selfCmd = new CreateTransactionCommand('s1', { ...dto, toStudentId: 's1' })
    await expect(handler.execute(selfCmd)).rejects.toThrow(BadRequestException)
  })

  it('throws ForbiddenException when weekly limit is reached', async () => {
    mockRepo.countWeekly.mockResolvedValue(3)
    await expect(handler.execute(cmd)).rejects.toThrow(ForbiddenException)
  })

  it('throws BadRequestException when sender is not found', async () => {
    mockRepo.countWeekly.mockResolvedValue(0)
    mockPrisma.student.findUnique.mockResolvedValue(null)
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException)
  })

  it('throws BadRequestException when sender has insufficient coins', async () => {
    mockRepo.countWeekly.mockResolvedValue(0)
    mockPrisma.student.findUnique
      .mockResolvedValueOnce({ id: 's1', coins: 10, courseId: 'c1' })
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException)
  })

  it('throws BadRequestException when recipient is not found', async () => {
    mockRepo.countWeekly.mockResolvedValue(0)
    mockPrisma.student.findUnique
      .mockResolvedValueOnce({ id: 's1', coins: 200, courseId: 'c1' })
      .mockResolvedValueOnce(null)
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException)
  })

  it('creates transaction atomically and returns mapped response', async () => {
    mockRepo.countWeekly.mockResolvedValue(1)
    mockPrisma.student.findUnique
      .mockResolvedValueOnce({ id: 's1', coins: 200, courseId: 'c1', name: 'Ana' })
      .mockResolvedValueOnce({ id: 's2', name: 'Pedro' })
    mockPrisma.$transaction.mockResolvedValue([{ id: 'tx1' }, {}, {}])
    mockPrisma.coinTransaction.findUnique.mockResolvedValue(fakeFullTx)

    const result = await handler.execute(cmd)

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
    expect(result.id).toBe('tx1')
    expect(result.amount).toBe(50)
    expect(result.fromStudent.name).toBe('Ana')
  })

  it('fires notification without awaiting (fire-and-forget)', async () => {
    mockRepo.countWeekly.mockResolvedValue(0)
    mockPrisma.student.findUnique
      .mockResolvedValueOnce({ id: 's1', coins: 200, courseId: 'c1', name: 'Ana' })
      .mockResolvedValueOnce({ id: 's2', name: 'Pedro' })
    mockPrisma.$transaction.mockResolvedValue([{ id: 'tx1' }, {}, {}])
    mockPrisma.coinTransaction.findUnique.mockResolvedValue(fakeFullTx)

    await handler.execute(cmd)
    expect(mockNotify.notifyAdminsNewTransaction).toHaveBeenCalledWith('s1', 's2', 50, 'tx1')
  })
})
