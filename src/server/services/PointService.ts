import { prisma } from '@/lib/prisma'

export class PointService {
  static async awardPoints(data: { courseId: string; studentId?: string; actionId?: string; points: number; reason: string }) {
    if (!data.courseId || data.points === undefined || !data.reason) {
      throw new Error('courseId, points y reason son requeridos')
    }
    const pts = Number(data.points)

    const action = data.actionId ? await prisma.action.findUnique({ where: { id: data.actionId } }) : null

    const shouldAffectClass  = action ? action.affectsClass   : true
    const shouldAffectStudent = data.studentId && (action ? action.affectsStudent : true)

    return await prisma.$transaction(async (tx) => {
      if (shouldAffectClass) {
        await tx.course.update({
          where: { id: data.courseId },
          data: { classPoints: { increment: pts } },
        })
      }
      if (shouldAffectStudent) {
        await tx.student.update({
          where: { id: data.studentId },
          data: { points: { increment: pts } },
        })
      }
      const log = await tx.pointLog.create({
        data: {
          courseId: data.courseId,
          studentId: data.studentId || null,
          actionId: data.actionId || null,
          points: pts,
          reason: data.reason
        },
        include: { student: { select: { name: true } }, action: true },
      })
      return log
    })
  }
}
