import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { ActionService } from '@/server/services/ActionService'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    const data = await req.json()
    const action = await ActionService.updateAction(params.id, data)
    return NextResponse.json(action)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    await ActionService.deleteAction(params.id)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
