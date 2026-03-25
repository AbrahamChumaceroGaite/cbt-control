import { prisma } from '@/lib/prisma'

export class RewardService {
  static async getAllRewards() {
    return await prisma.reward.findMany({
      orderBy: [{ type: 'asc' }, { pointsRequired: 'asc' }],
    })
  }

  static async createReward(data: { name: string; pointsRequired: number; description?: string; icon?: string; type?: string; isGlobal?: boolean }) {
    if (!data.name || data.pointsRequired === undefined) {
      throw new Error('name y pointsRequired son requeridos')
    }
    return await prisma.reward.create({
      data: {
        name: data.name,
        description: data.description || '',
        icon: data.icon || '★',
        pointsRequired: Number(data.pointsRequired),
        type: data.type || 'class',
        isGlobal: data.isGlobal ?? true,
      },
    })
  }

  static async updateReward(id: string, data: any) {
    return await prisma.reward.update({
      where: { id },
      data: { ...data, pointsRequired: data.pointsRequired !== undefined ? Number(data.pointsRequired) : undefined },
    })
  }

  static async deleteReward(id: string) {
    return await prisma.reward.delete({ where: { id } })
  }
}
