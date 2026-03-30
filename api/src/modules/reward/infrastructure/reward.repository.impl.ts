import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { RewardRepository } from '../domain/reward.repository'
import type { RewardEntity } from '../domain/reward.entity'

@Injectable()
export class RewardRepositoryImpl extends RewardRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  findAll(): Promise<RewardEntity[]> {
    return this.prisma.reward.findMany({ orderBy: [{ type: 'asc' }, { coinsRequired: 'asc' }] })
  }

  findById(id: string): Promise<RewardEntity | null> {
    return this.prisma.reward.findUnique({ where: { id } })
  }

  create(data: { name: string; coinsRequired: number; description?: string; icon?: string; type?: string; isGlobal?: boolean }): Promise<RewardEntity> {
    return this.prisma.reward.create({
      data: {
        name:          data.name,
        coinsRequired: Number(data.coinsRequired),
        description:   data.description ?? '',
        icon:          data.icon        ?? '★',
        type:          data.type        ?? 'class',
        isGlobal:      data.isGlobal    ?? true,
      },
    })
  }

  update(id: string, data: Partial<{ name: string; description: string; icon: string; coinsRequired: number; type: string; isGlobal: boolean; isActive: boolean }>): Promise<RewardEntity> {
    return this.prisma.reward.update({
      where: { id },
      data:  { ...data, ...(data.coinsRequired !== undefined && { coinsRequired: Number(data.coinsRequired) }) },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.reward.delete({ where: { id } })
  }
}
