import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const courses = await prisma.course.findMany({
    include: { _count: { select: { students: true } } },
    orderBy: [{ level: 'asc' }, { parallel: 'asc' }],
  })
  return NextResponse.json(courses)
}

export async function POST(req: Request) {
  const { name, level, parallel, plant } = await req.json()
  if (!name || !level || !parallel) {
    return NextResponse.json({ error: 'name, level y parallel son requeridos' }, { status: 400 })
  }
  const course = await prisma.course.create({
    data: { name, level, parallel, plant: plant || '' },
  })
  return NextResponse.json(course, { status: 201 })
}
