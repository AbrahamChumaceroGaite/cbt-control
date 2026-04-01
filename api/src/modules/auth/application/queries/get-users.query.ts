import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { PrismaService }              from '../../../../infrastructure/prisma/prisma.service'
import type { UserDetailResponse }    from '@control-aula/shared'

export class GetUsersQuery {}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery, UserDetailResponse[]> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<UserDetailResponse[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id:        true,
        code:      true,
        role:      true,
        fullName:  true,
        isActive:  true,
        createdAt: true,
        student:   {
          select: {
            id:   true,
            name: true,
            course: { select: { name: true } },
          },
        },
      },
      orderBy: { code: 'asc' },
    })

    return users.map(u => ({
      id:        u.id,
      code:      u.code,
      role:      u.role as 'admin' | 'student',
      fullName:  u.fullName,
      isActive:  u.isActive,
      createdAt: u.createdAt.toISOString(),
      student:   u.student ?? null,
    }))
  }
}
