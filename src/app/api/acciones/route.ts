import { NextResponse } from 'next/server'
import { ActionService } from '@/server/services/ActionService'

export async function GET() {
  try {
    const actions = await ActionService.getAllActions()
    return NextResponse.json(actions)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const action = await ActionService.createAction(data)
    return NextResponse.json(action, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
