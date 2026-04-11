import { Injectable } from '@nestjs/common'
import { PrismaService }   from '../../../infrastructure/prisma/prisma.service'
import { GroupRepository } from '../domain/group.repository'
import { GroupEntity }     from '../domain/group.entity'
import type { GroupMemberEntity } from '../domain/group.entity'

const MEMBER_INCLUDE = { members: { include: { student: { select: { id: true, name: true, coins: true } } } } }

@Injectable()
export class GroupRepositoryImpl extends GroupRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  async findAll(courseId?: string): Promise<GroupEntity[]> {
    const records = await this.prisma.group.findMany({
      where:   courseId ? { courseId } : undefined,
      include: MEMBER_INCLUDE,
      orderBy: { name: 'asc' },
    })
    return records.map(r => this.toDomain(r))
  }

  async findById(id: string): Promise<GroupEntity | null> {
    const record = await this.prisma.group.findUnique({
      where:   { id },
      include: MEMBER_INCLUDE,
    })
    return record ? this.toDomain(record) : null
  }

  async create(data: { name: string; courseId: string; studentIds?: string[] }): Promise<GroupEntity> {
    const record = await this.prisma.group.create({
      data: {
        name:     data.name,
        courseId: data.courseId,
        members:  data.studentIds?.length
          ? { create: data.studentIds.map(sid => ({ studentId: sid })) }
          : undefined,
      },
      include: MEMBER_INCLUDE,
    })
    return this.toDomain(record)
  }

  async update(id: string, data: { name?: string; studentIds?: string[] }): Promise<GroupEntity> {
    if (data.studentIds) {
      await this.prisma.groupMember.deleteMany({ where: { groupId: id } })
      if (data.studentIds.length > 0) {
        await this.prisma.groupMember.createMany({
          data: data.studentIds.map(sid => ({ groupId: id, studentId: sid })),
        })
      }
    }
    const record = await this.prisma.group.update({
      where:   { id },
      data:    data.name ? { name: data.name } : {},
      include: MEMBER_INCLUDE,
    })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.group.delete({ where: { id } })
  }

  private toDomain(record: {
    id: string; name: string; courseId: string
    createdAt: Date; updatedAt: Date
    members: GroupMemberEntity[]
  }): GroupEntity {
    return new GroupEntity(record)
  }
}
