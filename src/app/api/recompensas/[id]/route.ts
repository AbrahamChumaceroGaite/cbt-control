import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const reward = await prisma.reward.update({
    where: { id: params.id },
    data: { ...data, pointsRequired: data.pointsRequired ? Number(data.pointsRequired) : undefined },
  })
  return NextResponse.json(reward)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.reward.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
