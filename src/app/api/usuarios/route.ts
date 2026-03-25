import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  const users = await prisma.user.findMany({
    include: { student: { select: { id: true, name: true, course: { select: { name: true } } } } },
    orderBy: { code: 'asc' },
  })

  // Never expose passwordHash
  return NextResponse.json(users.map(({ passwordHash: _, ...u }) => u))
}

export async function POST(req: Request) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { code, password, role, studentId, fullName } = await req.json()

  if (!code || !password) {
    return NextResponse.json({ error: 'Código y contraseña requeridos' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(String(password), 12)

  const user = await prisma.user.create({
    data: {
      code: String(code).toLowerCase().trim(),
      passwordHash,
      role: role ?? 'student',
      studentId: studentId ?? null,
      fullName: fullName ?? '',
    },
    include: { student: { select: { id: true, name: true } } },
  })

  const { passwordHash: _, ...safeUser } = user as any
  return NextResponse.json(safeUser, { status: 201 })
}
