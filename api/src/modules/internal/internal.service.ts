import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService }    from '../../infrastructure/prisma/prisma.service'
import type { InternalCoinOpResponse, InternalStudentResponse } from '@control-aula/shared'
import type { GrantCoinsDto } from './dto/grant-coins.dto'
import type { SpendCoinsDto } from './dto/spend-coins.dto'

// Idempotency key prefix stored in CoinLog.reason
const IDEM_PREFIX = '[idem:'

@Injectable()
export class InternalService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudent(studentId: string): Promise<InternalStudentResponse> {
    const record = await this.prisma.student.findUnique({
      where:   { id: studentId },
      select:  { id: true, name: true, coins: true, courseId: true, course: { select: { name: true } } },
    })
    if (!record) throw new NotFoundException(`Student ${studentId} not found`)

    // Also check if user has a role (admin/teacher) for unlimited access
    const user = await this.prisma.user.findFirst({
      where:  { studentId },
      select: { role: true },
    })

    return {
      id:         record.id,
      name:       record.name,
      courseId:   record.courseId,
      courseName: record.course.name,
      coins:      record.coins,
      role:       user?.role ?? 'student',
    }
  }

  async grantCoins(dto: GrantCoinsDto): Promise<InternalCoinOpResponse> {
    const idemTag = `${IDEM_PREFIX}${dto.idempotencyKey}]`

    // Idempotency check: return early if already processed
    const existing = await this.prisma.coinLog.findFirst({
      where: { studentId: dto.studentId, reason: { contains: idemTag } },
      select: { id: true },
    })
    if (existing) {
      const student = await this.prisma.student.findUnique({
        where:  { id: dto.studentId },
        select: { coins: true },
      })
      return { studentId: dto.studentId, newBalance: student?.coins ?? 0, idempotencyKey: dto.idempotencyKey, alreadyApplied: true }
    }

    const student = await this.prisma.student.findUnique({
      where:  { id: dto.studentId },
      select: { id: true, coins: true, courseId: true },
    })
    if (!student) throw new NotFoundException(`Student ${dto.studentId} not found`)

    const [updated] = await this.prisma.$transaction([
      this.prisma.student.update({
        where: { id: dto.studentId },
        data:  { coins: { increment: dto.amount } },
        select: { coins: true },
      }),
      this.prisma.coinLog.create({
        data: {
          courseId:  student.courseId,
          studentId: dto.studentId,
          coins:     dto.amount,
          reason:    `${dto.reason} [src:${dto.sourceModule}/${dto.sourceId}] ${idemTag}`,
        },
      }),
    ])

    return { studentId: dto.studentId, newBalance: updated.coins, idempotencyKey: dto.idempotencyKey, alreadyApplied: false }
  }

  async spendCoins(dto: SpendCoinsDto): Promise<InternalCoinOpResponse> {
    const idemTag = `${IDEM_PREFIX}${dto.idempotencyKey}]`

    const existing = await this.prisma.coinLog.findFirst({
      where: { studentId: dto.studentId, reason: { contains: idemTag } },
      select: { id: true },
    })
    if (existing) {
      const student = await this.prisma.student.findUnique({
        where:  { id: dto.studentId },
        select: { coins: true },
      })
      return { studentId: dto.studentId, newBalance: student?.coins ?? 0, idempotencyKey: dto.idempotencyKey, alreadyApplied: true }
    }

    const student = await this.prisma.student.findUnique({
      where:  { id: dto.studentId },
      select: { id: true, coins: true, courseId: true },
    })
    if (!student) throw new NotFoundException(`Student ${dto.studentId} not found`)
    if (student.coins < dto.amount) {
      throw new BadRequestException(`Insufficient coins: has ${student.coins}, needs ${dto.amount}`)
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.student.update({
        where: { id: dto.studentId },
        data:  { coins: { decrement: dto.amount } },
        select: { coins: true },
      }),
      this.prisma.coinLog.create({
        data: {
          courseId:  student.courseId,
          studentId: dto.studentId,
          coins:     -dto.amount,
          reason:    `${dto.reason} [src:games/${dto.sourceId}] ${idemTag}`,
        },
      }),
    ])

    return { studentId: dto.studentId, newBalance: updated.coins, idempotencyKey: dto.idempotencyKey, alreadyApplied: false }
  }
}
