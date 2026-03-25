import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!session.studentId) return NextResponse.json({ error: 'No es estudiante' }, { status: 403 })

  const student = await prisma.student.findUnique({
    where: { id: session.studentId },
    include: {
      course: { select: { id: true, name: true, level: true, classCoins: true } },
      tramos: { orderBy: { awardedAt: 'asc' } },
      coinLogs: {
        include: { action: { select: { name: true, category: true } } },
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
      groupMemberships: {
        include: { group: { select: { id: true, name: true } } },
      },
      redemptionRequests: {
        include: { reward: { select: { name: true, icon: true, coinsRequired: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!student) return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 })
  return NextResponse.json(student)
}
