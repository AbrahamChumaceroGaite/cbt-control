import { prisma } from '@/lib/prisma'

export class PointService {
  static async awardCoins(data: { courseId: string; studentId?: string; actionId?: string; coins: number; reason: string }) {
    if (!data.courseId || data.coins === undefined || !data.reason) {
      throw new Error('courseId, coins y reason son requeridos')
    }
    const amount = Number(data.coins)

    const action = data.actionId ? await prisma.action.findUnique({ where: { id: data.actionId } }) : null

    const shouldAffectClass   = action ? action.affectsClass   : true
    const shouldAffectStudent = data.studentId && (action ? action.affectsStudent : true)

    return await prisma.$transaction(async (tx) => {
      if (shouldAffectClass) {
        await tx.course.update({
          where: { id: data.courseId },
          data: { classCoins: { increment: amount } },
        })
      }
      if (shouldAffectStudent) {
        await tx.student.update({
          where: { id: data.studentId },
          data: { coins: { increment: amount } },
        })
      }
      const log = await tx.coinLog.create({
        data: {
          courseId: data.courseId,
          studentId: data.studentId || null,
          actionId: data.actionId || null,
          coins: amount,
          reason: data.reason
        },
        include: { student: { select: { name: true } }, action: true },
      })
      return log
    })
  }
}
