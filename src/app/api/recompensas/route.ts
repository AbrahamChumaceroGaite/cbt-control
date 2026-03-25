import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { RewardService } from '@/server/services/RewardService'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    const rewards = await RewardService.getAllRewards()
    return NextResponse.json(rewards)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    const data = await req.json()
    const reward = await RewardService.createReward(data)
    return NextResponse.json(reward, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
