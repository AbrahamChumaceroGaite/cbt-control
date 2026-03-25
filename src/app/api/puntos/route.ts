import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { PointService } from '@/server/services/PointService'

export async function POST(req: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    const data = await req.json()
    // Accept both legacy `points` and new `coins` field names
    const coins = data.coins ?? data.points
    const log = await PointService.awardCoins({ ...data, coins })
    return NextResponse.json(log, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
