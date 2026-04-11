import { Injectable } from '@nestjs/common'
import { PrismaService }    from '../../../infrastructure/prisma/prisma.service'
import { ActionRepository } from '../domain/action.repository'
import { ActionEntity }     from '../domain/action.entity'

@Injectable()
export class ActionRepositoryImpl extends ActionRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  async findAll(): Promise<ActionEntity[]> {
    const records = await this.prisma.action.findMany({ orderBy: { name: 'asc' } })
    return records.map(r => this.toDomain(r))
  }

  async findById(id: string): Promise<ActionEntity | null> {
    const record = await this.prisma.action.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async create(data: {
    name: string
    coins: number
    category?: string
    affectsClass?: boolean
    affectsStudent?: boolean
  }): Promise<ActionEntity> {
    const record = await this.prisma.action.create({
      data: {
        name:           data.name,
        coins:          Number(data.coins),
        category:       data.category       ?? 'blue',
        affectsClass:   data.affectsClass   ?? true,
        affectsStudent: data.affectsStudent ?? true,
      },
    })
    return this.toDomain(record)
  }

  async update(
    id: string,
    data: Partial<{
      name: string; coins: number; category: string
      affectsClass: boolean; affectsStudent: boolean; isActive: boolean
    }>,
  ): Promise<ActionEntity> {
    const record = await this.prisma.action.update({
      where: { id },
      data:  { ...data, ...(data.coins !== undefined && { coins: Number(data.coins) }) },
    })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.action.delete({ where: { id } })
  }

  private toDomain(record: {
    id: string; name: string; coins: number; category: string
    affectsClass: boolean; affectsStudent: boolean; isActive: boolean
    createdAt: Date; updatedAt: Date
  }): ActionEntity {
    return new ActionEntity(record)
  }
}
