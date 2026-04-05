import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { BankRepository } from '../domain/bank.repository'
import type { TransactionEntity } from '../domain/transaction.entity'
import type { StudentSearchResult } from '@control-aula/shared'

const INCLUDE_FULL = {
  fromStudent: { select: { id: true, name: true, course: { select: { name: true } } } },
  toStudent:   { select: { id: true, name: true, course: { select: { name: true } } } },
}

@Injectable()
export class BankRepositoryImpl extends BankRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  create(data: { fromStudentId: string; toStudentId: string; amount: number; notes?: string }): Promise<TransactionEntity> {
    return this.prisma.coinTransaction.create({ data: { ...data, notes: data.notes ?? '' } })
  }

  findById(id: string): Promise<TransactionEntity | null> {
    return this.prisma.coinTransaction.findUnique({ where: { id } })
  }

  findByStudent(studentId: string): Promise<any[]> {
    return this.prisma.coinTransaction.findMany({
      where:   { OR: [{ fromStudentId: studentId }, { toStudentId: studentId }] },
      include: INCLUDE_FULL,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  findAll(status?: string, studentId?: string): Promise<any[]> {
    const where: any = {}
    if (status)    where.status = status
    if (studentId) where.OR = [{ fromStudentId: studentId }, { toStudentId: studentId }]
    return this.prisma.coinTransaction.findMany({
      where:   Object.keys(where).length ? where : undefined,
      include: INCLUDE_FULL,
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  }

  update(id: string, data: { status: string; adminNotes?: string }): Promise<TransactionEntity> {
    return this.prisma.coinTransaction.update({ where: { id }, data })
  }

  countWeekly(fromStudentId: string, since: Date): Promise<number> {
    return this.prisma.coinTransaction.count({
      where: {
        fromStudentId,
        createdAt: { gte: since },
        status:    { not: 'rejected' },
      },
    })
  }

  async searchStudents(q: string, excludeId: string, courseId?: string): Promise<StudentSearchResult[]> {
    if (q.trim().length < 2) return []
    const results = await this.prisma.student.findMany({
      where: {
        id:       { not: excludeId },
        name:     { contains: q },
        ...(courseId ? { courseId } : {}),
      },
      include: {
        user:   { select: { avatarUrl: true } },
        course: { select: { name: true } },
      },
      take: 8,
    })
    return results.map(s => ({
      id:         s.id,
      name:       s.name,
      courseName: s.course.name,
      avatarUrl:  s.user?.avatarUrl ?? undefined,
    }))
  }

  async getCourses(): Promise<{ id: string; name: string }[]> {
    return this.prisma.course.findMany({
      select:  { id: true, name: true },
      orderBy: [{ level: 'asc' }, { parallel: 'asc' }],
    })
  }
}
