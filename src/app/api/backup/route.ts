import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const [courses, actions, rewards, coinLogs, redemptionRequests] = await Promise.all([
      prisma.course.findMany({
        include: {
          students: {
            include: { tramos: true },
            orderBy: { name: 'asc' },
          },
          groups: {
            include: { members: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.action.findMany({ orderBy: { name: 'asc' } }),
      prisma.reward.findMany({ orderBy: { name: 'asc' } }),
      prisma.coinLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5000,
        include: {
          student: { select: { name: true, code: true } },
          action:  { select: { name: true, category: true } },
          course:  { select: { name: true } },
        },
      }),
      prisma.redemptionRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { name: true, code: true } },
          reward:  { select: { name: true } },
        },
      }),
    ])

    const payload = {
      version:   1,
      exportedAt: new Date().toISOString(),
      courses,
      actions,
      rewards,
      coinLogs,
      redemptionRequests,
    }

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-cbt-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
