import { prisma } from '@/lib/prisma'

export class ActionService {
  static async getAllActions() {
    return await prisma.action.findMany({ orderBy: { name: 'asc' } })
  }

  static async createAction(data: { name: string; coins: number; category?: string; affectsClass?: boolean; affectsStudent?: boolean }) {
    if (!data.name || data.coins === undefined) {
      throw new Error('name y coins son requeridos')
    }
    return await prisma.action.create({
      data: {
        name: data.name,
        coins: Number(data.coins),
        category: data.category || 'blue',
        affectsClass: data.affectsClass ?? true,
        affectsStudent: data.affectsStudent ?? true,
      },
    })
  }

  static async updateAction(id: string, data: any) {
    return await prisma.action.update({
      where: { id },
      data: { ...data, coins: data.coins !== undefined ? Number(data.coins) : undefined },
    })
  }

  static async deleteAction(id: string) {
    return await prisma.action.delete({ where: { id } })
  }
}
