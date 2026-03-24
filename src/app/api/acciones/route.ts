import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const actions = await prisma.action.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(actions)
}

export async function POST(req: Request) {
  const { name, points, category, affectsClass, affectsStudent } = await req.json()
  if (!name || points === undefined) {
    return NextResponse.json({ error: 'name y points son requeridos' }, { status: 400 })
  }
  const action = await prisma.action.create({
    data: {
      name, points: Number(points),
      category: category || 'blue',
      affectsClass: affectsClass ?? true,
      affectsStudent: affectsStudent ?? true,
    },
  })
  return NextResponse.json(action, { status: 201 })
}
