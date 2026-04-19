import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { InternalService } from '../internal.service'

// ── Prisma mock ──────────────────────────────────────────────────────────────

const mockStudent = {
  id:       's1',
  name:     'Ana López',
  coins:    50,
  courseId: 'c1',
  course:   { name: '3A' },
}

const mockPrisma = {
  student: {
    findUnique: vi.fn(),
    update:     vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
  coinLog: {
    findFirst: vi.fn(),
    create:    vi.fn(),
  },
  $transaction: vi.fn(),
}

function buildService() {
  return new InternalService(mockPrisma as never)
}

// ── getStudent ────────────────────────────────────────────────────────────────

describe('InternalService', () => {
  beforeEach(() => { vi.clearAllMocks() })

  describe('getStudent()', () => {
    it('returns student with role=student when no user record exists', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(mockStudent)
      mockPrisma.user.findFirst.mockResolvedValue(null)

      const svc    = buildService()
      const result = await svc.getStudent('s1')

      expect(result).toEqual({
        id:         's1',
        name:       'Ana López',
        courseId:   'c1',
        courseName: '3A',
        coins:      50,
        role:       'student',
      })
    })

    it('returns role from user record when it exists', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(mockStudent)
      mockPrisma.user.findFirst.mockResolvedValue({ role: 'admin' })

      const result = await buildService().getStudent('s1')
      expect(result.role).toBe('admin')
    })

    it('throws NotFoundException when student does not exist', async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null)

      await expect(buildService().getStudent('ghost')).rejects.toThrow(NotFoundException)
    })
  })

  // ── grantCoins ──────────────────────────────────────────────────────────────

  describe('grantCoins()', () => {
    const dto = {
      studentId:      's1',
      amount:         10,
      reason:         'Level complete',
      sourceId:       'tank-invaders',
      sourceModule:   'games' as const,
      idempotencyKey: 'idem-001',
    }

    it('grants coins and returns new balance', async () => {
      mockPrisma.coinLog.findFirst.mockResolvedValue(null)
      mockPrisma.student.findUnique.mockResolvedValue({ id: 's1', coins: 50, courseId: 'c1' })
      mockPrisma.$transaction.mockResolvedValue([{ coins: 60 }])

      const result = await buildService().grantCoins(dto)

      expect(result).toEqual({
        studentId:      's1',
        newBalance:     60,
        idempotencyKey: 'idem-001',
        alreadyApplied: false,
      })
      expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
    })

    it('returns alreadyApplied=true when idempotency key was already processed', async () => {
      mockPrisma.coinLog.findFirst.mockResolvedValue({ id: 'log1' })
      mockPrisma.student.findUnique.mockResolvedValue({ coins: 60 })

      const result = await buildService().grantCoins(dto)

      expect(result.alreadyApplied).toBe(true)
      expect(result.newBalance).toBe(60)
      expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    })

    it('throws NotFoundException when student does not exist', async () => {
      mockPrisma.coinLog.findFirst.mockResolvedValue(null)
      mockPrisma.student.findUnique.mockResolvedValue(null)

      await expect(buildService().grantCoins(dto)).rejects.toThrow(NotFoundException)
    })
  })

  // ── spendCoins ──────────────────────────────────────────────────────────────

  describe('spendCoins()', () => {
    const dto = {
      studentId:      's1',
      amount:         5,
      reason:         'Continue level',
      sourceId:       'session-abc',
      idempotencyKey: 'idem-002',
    }

    it('deducts coins and returns new balance', async () => {
      mockPrisma.coinLog.findFirst.mockResolvedValue(null)
      mockPrisma.student.findUnique.mockResolvedValue({ id: 's1', coins: 50, courseId: 'c1' })
      mockPrisma.$transaction.mockResolvedValue([{ coins: 45 }])

      const result = await buildService().spendCoins(dto)

      expect(result).toEqual({
        studentId:      's1',
        newBalance:     45,
        idempotencyKey: 'idem-002',
        alreadyApplied: false,
      })
      expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
    })

    it('returns alreadyApplied=true when idempotency key was already processed', async () => {
      mockPrisma.coinLog.findFirst.mockResolvedValue({ id: 'log2' })
      mockPrisma.student.findUnique.mockResolvedValue({ coins: 45 })

      const result = await buildService().spendCoins(dto)

      expect(result.alreadyApplied).toBe(true)
      expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    })

    it('throws NotFoundException when student does not exist', async () => {
      mockPrisma.coinLog.findFirst.mockResolvedValue(null)
      mockPrisma.student.findUnique.mockResolvedValue(null)

      await expect(buildService().spendCoins(dto)).rejects.toThrow(NotFoundException)
    })

    it('throws BadRequestException when student has insufficient coins', async () => {
      mockPrisma.coinLog.findFirst.mockResolvedValue(null)
      mockPrisma.student.findUnique.mockResolvedValue({ id: 's1', coins: 3, courseId: 'c1' })

      await expect(buildService().spendCoins({ ...dto, amount: 10 }))
        .rejects.toThrow(BadRequestException)
    })
  })
})
