import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { courseId, studentId, actionId, points, reason } = await req.json()
  if (!courseId || points === undefined || !reason) {
    return NextResponse.json({ error: 'courseId, points y reason son requeridos' }, { status: 400 })
  }
  const pts = Number(points)

  const action = actionId ? await prisma.action.findUnique({ where: { id: actionId } }) : null

  const shouldAffectClass  = action ? action.affectsClass   : true
  const shouldAffectStudent = studentId && (action ? action.affectsStudent : true)

  const [log] = await prisma.$transaction(async (tx) => {
    if (shouldAffectClass) {
      await tx.course.update({
        where: { id: courseId },
        data: { classPoints: { increment: pts } },
      })
    }
    if (shouldAffectStudent) {
      await tx.student.update({
        where: { id: studentId },
        data: { points: { increment: pts } },
      })
    }
    const log = await tx.pointLog.create({
      data: { courseId, studentId: studentId || null, actionId: actionId || null, points: pts, reason },
      include: { student: { select: { name: true } }, action: true },
    })
    return [log]
  })

  return NextResponse.json(log, { status: 201 })
}
