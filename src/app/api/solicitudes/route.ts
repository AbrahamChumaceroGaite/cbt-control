import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const requests = await prisma.redemptionRequest.findMany({
    include: {
      student: { select: { id: true, name: true, coins: true, course: { select: { name: true } } } },
      reward: { select: { name: true, icon: true, coinsRequired: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(requests)
}
