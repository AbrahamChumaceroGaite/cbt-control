import { Controller, Get, Res, UseGuards } from '@nestjs/common'
import type { Response }  from 'express'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { JwtAuthGuard }  from '../../common/guards/jwt-auth.guard'

@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async download(@Res() res: Response) {
    const [courses, actions, rewards, coinLogs, redemptionRequests] = await Promise.all([
      this.prisma.course.findMany({
        include: {
          students: { include: { tramos: true }, orderBy: { name: 'asc' } },
          groups:   { include: { members: true } },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.action.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.reward.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.coinLog.findMany({
        orderBy: { createdAt: 'desc' },
        take:    5000,
        include: {
          student: { select: { name: true, code: true } },
          action:  { select: { name: true, category: true } },
          course:  { select: { name: true } },
        },
      }),
      this.prisma.redemptionRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { name: true, code: true } },
          reward:  { select: { name: true } },
        },
      }),
    ])

    const payload = {
      version:    1,
      exportedAt: new Date().toISOString(),
      courses, actions, rewards, coinLogs, redemptionRequests,
    }

    const date = new Date().toISOString().split('T')[0]
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="backup-cbt-${date}.json"`)
    res.send(JSON.stringify(payload, null, 2))
  }
}
