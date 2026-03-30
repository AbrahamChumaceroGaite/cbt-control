import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { PortalRepository } from '../domain/portal.repository'
import type { PortalStudentResponse } from '@control-aula/shared'

@Injectable()
export class PortalRepositoryImpl extends PortalRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  async getStudentData(studentId: string): Promise<PortalStudentResponse | null> {
    const student = await this.prisma.student.findUnique({
      where:   { id: studentId },
      include: {
        course:              { select: { id: true, name: true, level: true, classCoins: true } },
        tramos:              { orderBy: { awardedAt: 'asc' } },
        coinLogs:            {
          include: { action: { select: { name: true, category: true } } },
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        groupMemberships:    { include: { group: { select: { id: true, name: true } } } },
        redemptionRequests:  {
          include: { reward: { select: { name: true, icon: true, coinsRequired: true } } },
          orderBy: { createdAt: 'desc' },
        },
        individualRedemptions: { select: { rewardId: true } },
      },
    })
    if (!student) return null

    return {
      id:                    student.id,
      name:                  student.name,
      coins:                 student.coins,
      course:                student.course,
      coinLogs:              student.coinLogs.map(l => ({
        id: l.id, coins: l.coins, reason: l.reason, createdAt: l.createdAt.toISOString(),
        action: l.action,
      })),
      groupMemberships:      student.groupMemberships,
      redemptionRequests:    student.redemptionRequests.map(r => ({
        id: r.id, status: r.status, notes: r.notes, createdAt: r.createdAt.toISOString(),
        reward: r.reward,
      })),
      individualRedemptions: student.individualRedemptions,
    }
  }

  async getIndividualRewards(studentId: string): Promise<{ id: string; name: string; icon: string; coinsRequired: number; description: string }[]> {
    return this.prisma.reward.findMany({
      where:   { type: 'individual', isActive: true },
      select:  { id: true, name: true, icon: true, coinsRequired: true, description: true },
      orderBy: { coinsRequired: 'asc' },
    })
  }

  async requestReward(studentId: string, rewardId: string): Promise<{ id: string; status: string }> {
    const [reward, student, existing] = await Promise.all([
      this.prisma.reward.findUnique({ where: { id: rewardId } }),
      this.prisma.student.findUnique({ where: { id: studentId } }),
      this.prisma.redemptionRequest.findFirst({ where: { studentId, rewardId, status: 'pending' } }),
    ])

    if (!reward || !reward.isActive) throw new NotFoundException('Recompensa no encontrada')
    if (!student || student.coins < reward.coinsRequired) throw new BadRequestException('Coins insuficientes')
    if (existing) throw new ConflictException('Ya tienes una solicitud pendiente para esta recompensa')

    return this.prisma.redemptionRequest.create({ data: { studentId, rewardId } })
  }
}
