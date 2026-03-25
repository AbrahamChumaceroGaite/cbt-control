import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { status, notes } = await req.json()
  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const request = await prisma.redemptionRequest.findUnique({
    where: { id: params.id },
    include: { reward: true },
  })

  if (!request) return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
  if (request.status !== 'pending') {
    return NextResponse.json({ error: 'Solicitud ya procesada' }, { status: 409 })
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (status === 'approved') {
      // Deduct coins from student
      const updatedStudent = await tx.student.update({
        where: { id: request.studentId },
        data: { coins: { decrement: request.reward.coinsRequired } },
      })
      // Create StudentRedemption record
      await tx.studentRedemption.create({
        data: { studentId: request.studentId, rewardId: request.rewardId },
      })
      // Create CoinLog for history
      await tx.coinLog.create({
        data: {
          courseId: updatedStudent.courseId,
          studentId: request.studentId,
          coins: -request.reward.coinsRequired,
          reason: `Recompensa canjeada: ${request.reward.name}`,
        },
      })
    }

    return tx.redemptionRequest.update({
      where: { id: params.id },
      data: { status, notes: notes ?? '' },
      include: {
        student: { select: { name: true, coins: true } },
        reward: { select: { name: true, icon: true } },
      },
    })
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError

  await prisma.redemptionRequest.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
