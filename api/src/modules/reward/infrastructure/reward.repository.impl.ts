import { Injectable } from '@nestjs/common'
import { PrismaService }    from '../../../infrastructure/prisma/prisma.service'
import { RewardRepository } from '../domain/reward.repository'
import { RewardEntity }     from '../domain/reward.entity'

@Injectable()
export class RewardRepositoryImpl extends RewardRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  async findAll(): Promise<RewardEntity[]> {
    const records = await this.prisma.reward.findMany({
      orderBy: [{ type: 'asc' }, { coinsRequired: 'asc' }],
    })
    return records.map(r => this.toDomain(r))
  }

  async findById(id: string): Promise<RewardEntity | null> {
    const record = await this.prisma.reward.findUnique({ where: { id } })
    return record ? this.toDomain(record) : null
  }

  async create(data: {
    name: string; coinsRequired: number; description?: string
    icon?: string; type?: string; isGlobal?: boolean; discount?: number
  }): Promise<RewardEntity> {
    const record = await this.prisma.reward.create({
      data: {
        name:          data.name,
        coinsRequired: Number(data.coinsRequired),
        description:   data.description ?? '',
        icon:          data.icon        ?? '★',
        type:          data.type        ?? 'class',
        isGlobal:      data.isGlobal    ?? true,
        discount:      data.discount    ?? 0,
      },
    })
    return this.toDomain(record)
  }

  async update(
    id: string,
    data: Partial<{
      name: string; description: string; icon: string
      coinsRequired: number; discount: number; type: string
      isGlobal: boolean; isActive: boolean
    }>,
  ): Promise<RewardEntity> {
    const record = await this.prisma.reward.update({
      where: { id },
      data:  {
        ...data,
        ...(data.coinsRequired !== undefined && { coinsRequired: Number(data.coinsRequired) }),
        ...(data.discount      !== undefined && { discount:      Number(data.discount) }),
      },
    })
    return this.toDomain(record)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reward.delete({ where: { id } })
  }

  private toDomain(record: {
    id: string; name: string; description: string; icon: string
    coinsRequired: number; discount: number; discountEndsAt: Date | null
    type: string; isGlobal: boolean; isActive: boolean
    createdAt: Date; updatedAt: Date
  }): RewardEntity {
    return new RewardEntity(record)
  }
}
