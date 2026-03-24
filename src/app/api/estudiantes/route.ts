import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const students = await prisma.student.findMany({
    where: courseId ? { courseId } : undefined,
    include: { tramos: { orderBy: { awardedAt: 'asc' } }, course: { select: { name: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(students)
}

export async function POST(req: Request) {
  const { courseId, name, code } = await req.json()
  if (!courseId || !name) {
    return NextResponse.json({ error: 'courseId y name son requeridos' }, { status: 400 })
  }
  const student = await prisma.student.create({
    data: { courseId, name, code: code || '' },
    include: { tramos: true },
  })
  return NextResponse.json(student, { status: 201 })
}
