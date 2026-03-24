import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const rewards = await prisma.reward.findMany({
    orderBy: [{ type: 'asc' }, { pointsRequired: 'asc' }],
  })
  return NextResponse.json(rewards)
}

export async function POST(req: Request) {
  const { name, description, icon, pointsRequired, type, isGlobal } = await req.json()
  if (!name || pointsRequired === undefined) {
    return NextResponse.json({ error: 'name y pointsRequired son requeridos' }, { status: 400 })
  }
  const reward = await prisma.reward.create({
    data: {
      name, description: description || '', icon: icon || '★',
      pointsRequired: Number(pointsRequired),
      type: type || 'class', isGlobal: isGlobal ?? true,
    },
  })
  return NextResponse.json(reward, { status: 201 })
}
