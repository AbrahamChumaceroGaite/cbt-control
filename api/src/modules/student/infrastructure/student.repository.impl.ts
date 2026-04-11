import { Injectable } from '@nestjs/common'
import { PrismaService }     from '../../../infrastructure/prisma/prisma.service'
import { StudentRepository } from '../domain/student.repository'
import { StudentEntity }     from '../domain/student.entity'
import type { StudentTramoEntity } from '../domain/student.entity'

const TRAMOS_ORDER = { tramos: { orderBy: { awardedAt: 'asc' as const } } }

@Injectable()
export class StudentRepositoryImpl extends StudentRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  async findAll(courseId?: string): Promise<StudentEntity[]> {
    const records = await this.prisma.student.findMany({
      where:   courseId ? { courseId } : undefined,
      include: { ...TRAMOS_ORDER, course: { select: { name: true } } },
      orderBy: { name: 'asc' },
    })
    return records.map(r => this.toDomain(r))
  }

  async findById(id: string): Promise<StudentEntity | null> {
    const record = await this.prisma.student.findUnique({
      where:   { id },
      include: {
        ...TRAMOS_ORDER,
        course: true,
        coinLogs: { include: { action: { select: { name: true, category: true } } }, orderBy: { createdAt: 'desc' }, take: 30 },
        individualRedemptions: { include: { reward: true }, orderBy: { redeemedAt: 'desc' } },
      },
    })
    return record ? this.toDomain(record) : null
  }

  async create(data: { courseId: string; name: string; code?: string; email?: string }): Promise<StudentEntity> {
    const record = await this.prisma.student.create({
      data:    { courseId: data.courseId, name: data.name, code: data.code ?? '', email: data.email ?? '' },
      include: { tramos: true },
    })
    return this.toDomain(record)
  }

  async createMany(courseId: string, students: { name: string; code?: string; email?: string }[]): Promise<number> {
    const result = await this.prisma.student.createMany({
      data: students.map(s => ({ courseId, name: s.name, code: s.code ?? '', email: s.email ?? '' })),
    })
    return result.count
  }

  async update(id: string, data: { name?: string; code?: string; email?: string; coins?: number; tramos?: string[] }): Promise<StudentEntity> {
    if (data.tramos) {
      await this.prisma.studentTramo.deleteMany({ where: { studentId: id } })
      if (data.tramos.length > 0) {
        await this.prisma.studentTramo.createMany({
          data: data.tramos.map(tramo => ({ studentId: id, tramo })),
        })
      }
    }
    const record = await this.prisma.student.update({
      where:   { id },
      data:    {
        ...(data.name  !== undefined && { name:  data.name }),
        ...(data.code  !== undefined && { code:  data.code }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.coins !== undefined && { coins: data.coins }),
      },
      include: {
        tramos: true,
        course: { select: { name: true, classCoins: true } },
      },
    })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.student.delete({ where: { id } })
  }

  private toDomain(record: {
    id: string; courseId: string; code: string; name: string; email: string | null
    coins: number; createdAt: Date
    tramos: StudentTramoEntity[]
    course?: { name: string; classCoins?: number } | null
  }): StudentEntity {
    return new StudentEntity({
      ...record,
      course: record.course ?? undefined,
    })
  }
}
