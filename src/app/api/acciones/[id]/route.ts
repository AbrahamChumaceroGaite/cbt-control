import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const action = await prisma.action.update({
    where: { id: params.id },
    data: { ...data, points: data.points !== undefined ? Number(data.points) : undefined },
  })
  return NextResponse.json(action)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.action.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
