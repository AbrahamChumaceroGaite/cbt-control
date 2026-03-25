import { prisma } from '@/lib/prisma'

export class StudentService {
  static async getStudentsByCourse(courseId?: string | null) {
    return await prisma.student.findMany({
      where: courseId ? { courseId } : undefined,
      include: { tramos: { orderBy: { awardedAt: 'asc' } }, course: { select: { name: true } } },
      orderBy: { name: 'asc' },
    })
  }

  static async createStudent(data: { courseId: string; name: string; code?: string; email?: string }) {
    if (!data.courseId || !data.name) {
      throw new Error('courseId y name son requeridos')
    }
    return await prisma.student.create({
      data: {
        courseId: data.courseId,
        name: data.name,
        code: data.code || '',
        email: data.email || ''
      },
      include: { tramos: true },
    })
  }

  static async createManyStudents(courseId: string, students: any[]) {
    return await prisma.student.createMany({
      data: students.map((s: any) => ({
        courseId,
        name: s.name,
        email: s.email,
        code: s.code || '',
      })),
    })
  }

  static async getStudentById(id: string) {
    return await prisma.student.findUnique({
      where: { id },
      include: {
        tramos: { orderBy: { awardedAt: 'asc' } },
        course: true,
        pointLogs: { include: { action: true }, orderBy: { createdAt: 'desc' }, take: 30 },
        individualRedemptions: { include: { reward: true }, orderBy: { redeemedAt: 'desc' } },
      },
    })
  }

  static async updateStudent(id: string, data: { name?: string; code?: string; points?: number; email?: string; tramos?: string[] }) {
    if (data.tramos && Array.isArray(data.tramos)) {
      await prisma.studentTramo.deleteMany({ where: { studentId: id } })
      if (data.tramos.length > 0) {
        await prisma.studentTramo.createMany({
          data: data.tramos.map((tramo: string) => ({ studentId: id, tramo })),
        })
      }
    }

    return await prisma.student.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.points !== undefined && { points: data.points })
      },
      include: { tramos: true },
    })
  }

  static async deleteStudent(id: string) {
    return await prisma.student.delete({ where: { id } })
  }
}
