import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!session.studentId) return NextResponse.json({ error: 'No es estudiante' }, { status: 403 })

  const requests = await prisma.redemptionRequest.findMany({
    where: { studentId: session.studentId },
    include: { reward: { select: { name: true, icon: true, coinsRequired: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(requests)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (!session.studentId) return NextResponse.json({ error: 'No es estudiante' }, { status: 403 })

  const { rewardId } = await req.json()
  if (!rewardId) return NextResponse.json({ error: 'rewardId requerido' }, { status: 400 })

  // Check reward exists and is individual
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } })
  if (!reward || !reward.isActive) {
    return NextResponse.json({ error: 'Recompensa no encontrada' }, { status: 404 })
  }

  // Check student has enough coins
  const student = await prisma.student.findUnique({ where: { id: session.studentId } })
  if (!student || student.coins < reward.coinsRequired) {
    return NextResponse.json({ error: 'Coins insuficientes' }, { status: 400 })
  }

  // Check no pending request for same reward
  const existing = await prisma.redemptionRequest.findFirst({
    where: { studentId: session.studentId, rewardId, status: 'pending' },
  })
  if (existing) {
    return NextResponse.json({ error: 'Ya tienes una solicitud pendiente para esta recompensa' }, { status: 409 })
  }

  const request = await prisma.redemptionRequest.create({
    data: { studentId: session.studentId, rewardId },
    include: { reward: { select: { name: true, icon: true, coinsRequired: true } } },
  })

  return NextResponse.json(request, { status: 201 })
}
