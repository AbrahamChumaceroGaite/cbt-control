import { prisma } from '@/lib/prisma'

export class RewardService {
  static async getAllRewards() {
    return await prisma.reward.findMany({
      orderBy: [{ type: 'asc' }, { coinsRequired: 'asc' }],
    })
  }

  static async createReward(data: { name: string; coinsRequired: number; description?: string; icon?: string; type?: string; isGlobal?: boolean }) {
    if (!data.name || data.coinsRequired === undefined) {
      throw new Error('name y coinsRequired son requeridos')
    }
    return await prisma.reward.create({
      data: {
        name: data.name,
        description: data.description || '',
        icon: data.icon || '★',
        coinsRequired: Number(data.coinsRequired),
        type: data.type || 'class',
        isGlobal: data.isGlobal ?? true,
      },
    })
  }

  static async updateReward(id: string, data: any) {
    return await prisma.reward.update({
      where: { id },
      data: { ...data, coinsRequired: data.coinsRequired !== undefined ? Number(data.coinsRequired) : undefined },
    })
  }

  static async deleteReward(id: string) {
    return await prisma.reward.delete({ where: { id } })
  }
}
