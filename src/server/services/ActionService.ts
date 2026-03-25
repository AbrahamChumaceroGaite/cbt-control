import { prisma } from '@/lib/prisma'

export class ActionService {
  static async getAllActions() {
    return await prisma.action.findMany({ orderBy: { name: 'asc' } })
  }

  static async createAction(data: { name: string; points: number; category?: string; affectsClass?: boolean; affectsStudent?: boolean }) {
    if (!data.name || data.points === undefined) {
      throw new Error('name y points son requeridos')
    }
    return await prisma.action.create({
      data: {
        name: data.name,
        points: Number(data.points),
        category: data.category || 'blue',
        affectsClass: data.affectsClass ?? true,
        affectsStudent: data.affectsStudent ?? true,
      },
    })
  }

  static async updateAction(id: string, data: any) {
    return await prisma.action.update({
      where: { id },
      data: { ...data, points: data.points !== undefined ? Number(data.points) : undefined },
    })
  }

  static async deleteAction(id: string) {
    return await prisma.action.delete({ where: { id } })
  }
}
