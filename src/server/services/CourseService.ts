import { prisma } from '@/lib/prisma'

export class CourseService {
  static async getAllCourses() {
    return await prisma.course.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: [{ level: 'asc' }, { parallel: 'asc' }],
    })
  }

  static async createCourse(data: { name: string; level: string; parallel: string }) {
    if (!data.name || !data.level || !data.parallel) {
      throw new Error('Name, level and parallel are required')
    }
    return await prisma.course.create({
      data: {
        name: data.name,
        level: data.level,
        parallel: data.parallel,
      },
    })
  }

  static async getCourseById(id: string) {
    return await prisma.course.findUnique({
      where: { id },
      include: {
        students: {
          orderBy: { name: 'asc' },
          include: { tramos: true }
        },
        coinLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { student: true, action: true }
        }
      }
    })
  }

  static async updateCourse(id: string, data: { name: string; level: string; parallel: string }) {
    return await prisma.course.update({
      where: { id },
      data: {
        name: data.name,
        level: data.level,
        parallel: data.parallel,
      },
    })
  }

  static async deleteCourse(id: string) {
    return await prisma.course.delete({ where: { id } })
  }
}
