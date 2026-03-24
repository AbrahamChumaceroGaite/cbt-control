import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: { members: { include: { student: { select: { id: true, name: true, points: true } } } } },
  })
  if (!group) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(group)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { name, studentIds } = await req.json()

  if (studentIds && Array.isArray(studentIds)) {
    await prisma.groupMember.deleteMany({ where: { groupId: params.id } })
    if (studentIds.length > 0) {
      await prisma.groupMember.createMany({
        data: studentIds.map((sid: string) => ({ groupId: params.id, studentId: sid })),
      })
    }
  }

  const group = await prisma.group.update({
    where: { id: params.id },
    data: { ...(name && { name }) },
    include: { members: { include: { student: { select: { id: true, name: true, points: true } } } } },
  })
  return NextResponse.json(group)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.group.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
