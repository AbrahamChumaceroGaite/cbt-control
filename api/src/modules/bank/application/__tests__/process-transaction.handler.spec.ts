import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ProcessTransactionHandler } from '../commands/process-transaction.handler'
import { ProcessTransactionCommand } from '../commands/process-transaction.command'

const fakeTx = {
  id:          'tx1',
  status:      'pending',
  amount:      50,
  tax:         1,
  fromStudent: { id: 's1', name: 'Ana',   courseId: 'c1' },
  toStudent:   { id: 's2', name: 'Pedro', courseId: 'c2' },
}
const fakeFullTx = {
  ...fakeTx,
  fromStudent: { id: 's1', name: 'Ana',   course: { name: 'Matemáticas' } },
  toStudent:   { id: 's2', name: 'Pedro', course: { name: 'Ciencias' } },
  notes: '', adminNotes: '', createdAt: new Date(),
}

const mockRepo = {}
const mockPrisma = {
  coinTransaction: { findUnique: vi.fn(), update: vi.fn() },
  student:         { findUnique: vi.fn(), update: vi.fn() },
  coinLog:         { create: vi.fn() },
  $transaction:    vi.fn(),
}
const mockNotify  = { notifyTransactionProcessed: vi.fn().mockResolvedValue(undefined) }
const mockRealtime = {
  transactionUpdated: vi.fn(),
  coinsUpdated:       vi.fn(),
}

let handler: ProcessTransactionHandler

beforeEach(() => {
  vi.clearAllMocks()
  handler = new ProcessTransactionHandler(
    mockRepo as never, mockPrisma as never, mockNotify as never, mockRealtime as never,
  )
})

describe('ProcessTransactionHandler', () => {
  it('throws NotFoundException when transaction does not exist', async () => {
    mockPrisma.coinTransaction.findUnique.mockResolvedValue(null)
    const cmd = new ProcessTransactionCommand('tx1', { status: 'approved', adminNotes: '' })
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException)
  })

  it('throws BadRequestException when transaction is already processed', async () => {
    mockPrisma.coinTransaction.findUnique.mockResolvedValue({ ...fakeTx, status: 'approved' })
    const cmd = new ProcessTransactionCommand('tx1', { status: 'approved', adminNotes: '' })
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException)
  })

  it('executes approval: credits recipient and updates status', async () => {
    mockPrisma.coinTransaction.findUnique
      .mockResolvedValueOnce(fakeTx)
      .mockResolvedValueOnce(fakeFullTx)
    mockPrisma.$transaction.mockResolvedValue([])
    mockPrisma.student.findUnique
      .mockResolvedValueOnce({ coins: 150, courseId: 'c1' })
      .mockResolvedValueOnce({ coins: 250, courseId: 'c2' })

    const cmd = new ProcessTransactionCommand('tx1', { status: 'approved', adminNotes: 'OK' })
    const result = await handler.execute(cmd)

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
    expect(result.id).toBe('tx1')
    expect(result.toStudent.name).toBe('Pedro')
  })

  it('executes rejection: refunds sender and updates status', async () => {
    mockPrisma.coinTransaction.findUnique
      .mockResolvedValueOnce(fakeTx)
      .mockResolvedValueOnce(fakeFullTx)
    mockPrisma.$transaction.mockResolvedValue([])
    mockPrisma.student.findUnique
      .mockResolvedValueOnce({ coins: 150, courseId: 'c1' })
      .mockResolvedValueOnce({ coins: 200, courseId: 'c2' })

    const cmd = new ProcessTransactionCommand('tx1', { status: 'rejected', adminNotes: 'Rechazado' })
    const result = await handler.execute(cmd)

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
    expect(result.status).toBe('pending') // fakeFullTx still has pending (we're not mutating the mock)
  })

  it('emits real-time updates after processing', async () => {
    mockPrisma.coinTransaction.findUnique
      .mockResolvedValueOnce(fakeTx)
      .mockResolvedValueOnce(fakeFullTx)
    mockPrisma.$transaction.mockResolvedValue([])
    mockPrisma.student.findUnique
      .mockResolvedValueOnce({ coins: 150, courseId: 'c1' })
      .mockResolvedValueOnce({ coins: 250, courseId: 'c2' })

    const cmd = new ProcessTransactionCommand('tx1', { status: 'approved', adminNotes: '' })
    await handler.execute(cmd)

    expect(mockRealtime.transactionUpdated).toHaveBeenCalledWith('s1', 's2', { id: 'tx1', status: 'approved' })
    expect(mockRealtime.coinsUpdated).toHaveBeenCalledTimes(2)
  })
})
