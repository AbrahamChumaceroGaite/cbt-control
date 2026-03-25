import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { GroupService } from '@/server/services/GroupService'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    const group = await GroupService.getGroupById(params.id)
    if (!group) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(group)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    const data = await req.json()
    const group = await GroupService.updateGroup(params.id, {
      name: data.name,
      studentIds: data.memberIds || data.studentIds
    })
    return NextResponse.json(group)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError
  try {
    await GroupService.deleteGroup(params.id)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
