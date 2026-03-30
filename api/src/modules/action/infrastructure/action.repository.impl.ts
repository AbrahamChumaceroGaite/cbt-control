import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { ActionRepository } from '../domain/action.repository'
import type { ActionEntity } from '../domain/action.entity'

@Injectable()
export class ActionRepositoryImpl extends ActionRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  findAll(): Promise<ActionEntity[]> {
    return this.prisma.action.findMany({ orderBy: { name: 'asc' } })
  }

  findById(id: string): Promise<ActionEntity | null> {
    return this.prisma.action.findUnique({ where: { id } })
  }

  create(data: { name: string; coins: number; category?: string; affectsClass?: boolean; affectsStudent?: boolean }): Promise<ActionEntity> {
    return this.prisma.action.create({
      data: {
        name:           data.name,
        coins:          Number(data.coins),
        category:       data.category       ?? 'blue',
        affectsClass:   data.affectsClass   ?? true,
        affectsStudent: data.affectsStudent ?? true,
      },
    })
  }

  update(id: string, data: Partial<{ name: string; coins: number; category: string; affectsClass: boolean; affectsStudent: boolean; isActive: boolean }>): Promise<ActionEntity> {
    return this.prisma.action.update({
      where: { id },
      data:  { ...data, ...(data.coins !== undefined && { coins: Number(data.coins) }) },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.action.delete({ where: { id } })
  }
}
