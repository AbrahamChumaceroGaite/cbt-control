import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      tramos: { orderBy: { awardedAt: 'asc' } },
      course: true,
      pointLogs: { include: { action: true }, orderBy: { createdAt: 'desc' }, take: 30 },
      individualRedemptions: { include: { reward: true }, orderBy: { redeemedAt: 'desc' } },
    },
  })
  if (!student) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(student)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { name, code, points, tramos } = await req.json()

  if (tramos && Array.isArray(tramos)) {
    await prisma.studentTramo.deleteMany({ where: { studentId: params.id } })
    if (tramos.length > 0) {
      await prisma.studentTramo.createMany({
        data: tramos.map((tramo: string) => ({ studentId: params.id, tramo })),
      })
    }
  }

  const student = await prisma.student.update({
    where: { id: params.id },
    data: { ...(name && { name }), ...(code !== undefined && { code }), ...(points !== undefined && { points }) },
    include: { tramos: true },
  })
  return NextResponse.json(student)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.student.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
