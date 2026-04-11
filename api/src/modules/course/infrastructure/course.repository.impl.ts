import { Injectable } from '@nestjs/common'
import { PrismaService }     from '../../../infrastructure/prisma/prisma.service'
import { CourseRepository }  from '../domain/course.repository'
import { CourseEntity }      from '../domain/course.entity'
import type { CourseStudentEntity, CourseCoinLogEntity } from '../domain/course-detail.types'

const STUDENT_INCLUDE = { tramos: { orderBy: { awardedAt: 'asc' as const } } }
const LOG_INCLUDE     = { student: { select: { name: true } }, action: { select: { name: true, category: true } } }

@Injectable()
export class CourseRepositoryImpl extends CourseRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  async findAll(): Promise<CourseEntity[]> {
    const records = await this.prisma.course.findMany({
      include:  { _count: { select: { students: true } } },
      orderBy: [{ level: 'asc' }, { parallel: 'asc' }],
    })
    return records.map(r => this.toDomain(r))
  }

  async findById(id: string): Promise<CourseEntity | null> {
    const record = await this.prisma.course.findUnique({
      where:   { id },
      include: {
        students: { orderBy: { name: 'asc' }, include: STUDENT_INCLUDE },
        coinLogs: { orderBy: { createdAt: 'desc' }, take: 50, include: LOG_INCLUDE },
      },
    })
    return record ? this.toDomain(record) : null
  }

  async create(data: { name: string; level: string; parallel: string }): Promise<CourseEntity> {
    const record = await this.prisma.course.create({ data })
    return this.toDomain(record)
  }

  async update(id: string, data: { name?: string; level?: string; parallel?: string; classCoins?: number }): Promise<CourseEntity> {
    const record = await this.prisma.course.update({ where: { id }, data })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.course.delete({ where: { id } })
  }

  private toDomain(record: {
    id: string; name: string; level: string; parallel: string; classCoins: number
    createdAt: Date; updatedAt: Date
    _count?: { students: number }
    students?: CourseStudentEntity[]
    coinLogs?: CourseCoinLogEntity[]
  }): CourseEntity {
    return new CourseEntity(record)
  }
}
