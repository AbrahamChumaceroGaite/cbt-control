import { prisma } from '@/lib/prisma'

export class GroupService {
  static async getGroupsByCourse(courseId?: string | null) {
    return await prisma.group.findMany({
      where: courseId ? { courseId } : undefined,
      include: { members: { include: { student: { select: { id: true, name: true, points: true } } } } },
      orderBy: { name: 'asc' },
    })
  }

  static async createGroup(data: { name: string; courseId: string; studentIds?: string[] }) {
    if (!data.name || !data.courseId) {
      throw new Error('name y courseId son requeridos')
    }
    return await prisma.group.create({
      data: {
        name: data.name,
        courseId: data.courseId,
        members: data.studentIds?.length ? { create: data.studentIds.map((sid: string) => ({ studentId: sid })) } : undefined,
      },
      include: { members: { include: { student: { select: { id: true, name: true } } } } },
    })
  }

  static async getGroupById(id: string) {
    return await prisma.group.findUnique({
      where: { id },
      include: { members: { include: { student: { select: { id: true, name: true, points: true } } } } },
    })
  }

  static async updateGroup(id: string, data: { name?: string; studentIds?: string[] }) {
    if (data.studentIds && Array.isArray(data.studentIds)) {
      await prisma.groupMember.deleteMany({ where: { groupId: id } })
      if (data.studentIds.length > 0) {
        await prisma.groupMember.createMany({
          data: data.studentIds.map((sid: string) => ({ groupId: id, studentId: sid })),
        })
      }
    }

    return await prisma.group.update({
      where: { id },
      data: { ...(data.name && { name: data.name }) },
      include: { members: { include: { student: { select: { id: true, name: true, points: true } } } } },
    })
  }

  static async deleteGroup(id: string) {
    return await prisma.group.delete({ where: { id } })
  }
}
