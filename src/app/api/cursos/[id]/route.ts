import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      students: { include: { tramos: true }, orderBy: { name: 'asc' } },
      redemptions: { include: { reward: true }, orderBy: { redeemedAt: 'desc' } },
      pointLogs: {
        include: { student: { select: { name: true } }, action: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  })
  if (!course) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(course)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { name, level, parallel, plant, classPoints } = await req.json()
  const course = await prisma.course.update({
    where: { id: params.id },
    data: { name, level, parallel, plant, classPoints },
  })
  return NextResponse.json(course)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.course.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
