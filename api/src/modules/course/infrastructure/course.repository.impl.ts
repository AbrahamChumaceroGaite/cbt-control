import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { CourseRepository } from '../domain/course.repository'
import type { CourseEntity } from '../domain/course.entity'

const STUDENT_INCLUDE = { tramos: { orderBy: { awardedAt: 'asc' as const } } }
const LOG_INCLUDE     = { student: { select: { name: true } }, action: { select: { name: true, category: true } } }

@Injectable()
export class CourseRepositoryImpl extends CourseRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  findAll(): Promise<CourseEntity[]> {
    return this.prisma.course.findMany({
      include:  { _count: { select: { students: true } } },
      orderBy: [{ level: 'asc' }, { parallel: 'asc' }],
    })
  }

  findById(id: string): Promise<CourseEntity | null> {
    return this.prisma.course.findUnique({
      where:   { id },
      include: {
        students: { orderBy: { name: 'asc' }, include: STUDENT_INCLUDE },
        coinLogs: { orderBy: { createdAt: 'desc' }, take: 50, include: LOG_INCLUDE },
      },
    })
  }

  create(data: { name: string; level: string; parallel: string }): Promise<CourseEntity> {
    return this.prisma.course.create({ data })
  }

  update(id: string, data: { name?: string; level?: string; parallel?: string; classCoins?: number }): Promise<CourseEntity> {
    return this.prisma.course.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.course.delete({ where: { id } })
  }
}
