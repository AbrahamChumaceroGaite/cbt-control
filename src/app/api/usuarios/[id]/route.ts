import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { password, fullName, isActive, studentId } = await req.json()

  const data: any = {}
  if (password) data.passwordHash = await bcrypt.hash(String(password), 12)
  if (fullName !== undefined) data.fullName = fullName
  if (isActive !== undefined) data.isActive = isActive
  if (studentId !== undefined) data.studentId = studentId || null

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    include: { student: { select: { id: true, name: true } } },
  })

  const { passwordHash: _, ...safeUser } = user as any
  return NextResponse.json(safeUser)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin()
  if (authError) return authError

  // Prevent deleting admin accounts if they're the last admin
  const user = await prisma.user.findUnique({ where: { id: params.id } })
  if (user?.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin', isActive: true } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'No se puede eliminar el último administrador' }, { status: 400 })
    }
  }

  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
