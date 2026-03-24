import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courseId = searchParams.get('courseId')
  const groups = await prisma.group.findMany({
    where: courseId ? { courseId } : undefined,
    include: { members: { include: { student: { select: { id: true, name: true, points: true } } } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(groups)
}

export async function POST(req: Request) {
  const { name, courseId, studentIds } = await req.json()
  if (!name || !courseId) {
    return NextResponse.json({ error: 'name y courseId son requeridos' }, { status: 400 })
  }
  const group = await prisma.group.create({
    data: {
      name,
      courseId,
      members: studentIds?.length ? { create: studentIds.map((sid: string) => ({ studentId: sid })) } : undefined,
    },
    include: { members: { include: { student: { select: { id: true, name: true } } } } },
  })
  return NextResponse.json(group, { status: 201 })
}
