import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const authError = await requireAuth()
  if (authError) return authError

  const rewards = await prisma.reward.findMany({
    where: { type: 'individual', isActive: true },
    orderBy: { coinsRequired: 'asc' },
  })

  return NextResponse.json(rewards)
}
