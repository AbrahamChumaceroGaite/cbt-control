import { NextResponse } from 'next/server'
import { PointService } from '@/server/services/PointService'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const log = await PointService.awardPoints(data)
    return NextResponse.json(log, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
