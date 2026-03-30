import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { PointRepository } from '../domain/point.repository'
import type { CoinLogEntity } from '../domain/coin-log.entity'

@Injectable()
export class PointRepositoryImpl extends PointRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  async awardCoins(data: {
    courseId:   string
    studentId?: string
    actionId?:  string
    coins:      number
    reason:     string
  }): Promise<CoinLogEntity> {
    const action = data.actionId
      ? await this.prisma.action.findUnique({ where: { id: data.actionId } })
      : null

    const affectClass   = action ? action.affectsClass   : true
    const affectStudent = data.studentId && (action ? action.affectsStudent : true)

    return this.prisma.$transaction(async (tx) => {
      if (affectClass) {
        await tx.course.update({ where: { id: data.courseId }, data: { classCoins: { increment: data.coins } } })
      }
      if (affectStudent) {
        await tx.student.update({ where: { id: data.studentId }, data: { coins: { increment: data.coins } } })
      }
      return tx.coinLog.create({
        data: {
          courseId:  data.courseId,
          studentId: data.studentId ?? null,
          actionId:  data.actionId  ?? null,
          coins:     data.coins,
          reason:    data.reason,
        },
        include: { student: { select: { name: true } }, action: { select: { name: true, category: true } } },
      })
    })
  }
}
