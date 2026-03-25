import { NextResponse } from 'next/server'
import { RewardService } from '@/server/services/RewardService'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json()
    const reward = await RewardService.updateReward(params.id, data)
    return NextResponse.json(reward)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await RewardService.deleteReward(params.id)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
