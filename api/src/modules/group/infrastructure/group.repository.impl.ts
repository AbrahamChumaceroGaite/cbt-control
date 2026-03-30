import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { GroupRepository } from '../domain/group.repository'
import type { GroupEntity } from '../domain/group.entity'

const MEMBER_INCLUDE = { members: { include: { student: { select: { id: true, name: true, coins: true } } } } }

@Injectable()
export class GroupRepositoryImpl extends GroupRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  findAll(courseId?: string): Promise<GroupEntity[]> {
    return this.prisma.group.findMany({
      where:   courseId ? { courseId } : undefined,
      include: MEMBER_INCLUDE,
      orderBy: { name: 'asc' },
    })
  }

  findById(id: string): Promise<GroupEntity | null> {
    return this.prisma.group.findUnique({ where: { id }, include: MEMBER_INCLUDE })
  }

  create(data: { name: string; courseId: string; studentIds?: string[] }): Promise<GroupEntity> {
    return this.prisma.group.create({
      data: {
        name:     data.name,
        courseId: data.courseId,
        members:  data.studentIds?.length
          ? { create: data.studentIds.map(sid => ({ studentId: sid })) }
          : undefined,
      },
      include: MEMBER_INCLUDE,
    })
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
    return this.prisma.group.update({
      where:   { id },
      data:    data.name ? { name: data.name } : {},
      include: MEMBER_INCLUDE,
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.group.delete({ where: { id } })
  }
}
