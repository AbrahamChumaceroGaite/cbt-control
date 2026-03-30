import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../../infrastructure/prisma/prisma.service'
import { UserRepository } from '../domain/user.repository'
import type { UserEntity } from '../domain/user.entity'

type UserSafe = Omit<UserEntity, 'passwordHash'>

@Injectable()
export class UserRepositoryImpl extends UserRepository {
  constructor(private readonly prisma: PrismaService) { super() }

  findAll(): Promise<UserSafe[]> {
    return this.prisma.user.findMany({
      select: { id: true, code: true, role: true, studentId: true, fullName: true, isActive: true, createdAt: true, updatedAt: true },
      orderBy: { code: 'asc' },
    }) as Promise<UserSafe[]>
  }

  findByCode(code: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { code } }) as Promise<UserEntity | null>
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { id } }) as Promise<UserEntity | null>
  }

  create(data: { code: string; passwordHash: string; role: string; studentId?: string; fullName?: string }): Promise<UserSafe> {
    return this.prisma.user.create({
      data:   { code: data.code, passwordHash: data.passwordHash, role: data.role, studentId: data.studentId, fullName: data.fullName ?? '' },
      select: { id: true, code: true, role: true, studentId: true, fullName: true, isActive: true, createdAt: true, updatedAt: true },
    }) as Promise<UserSafe>
  }

  update(id: string, data: Partial<{ code: string; passwordHash: string; role: string; fullName: string; isActive: boolean }>): Promise<UserSafe> {
    return this.prisma.user.update({
      where:  { id },
      data,
      select: { id: true, code: true, role: true, studentId: true, fullName: true, isActive: true, createdAt: true, updatedAt: true },
    }) as Promise<UserSafe>
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } })
  }
}
