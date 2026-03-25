import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { code, password, mode } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { code: String(code).toLowerCase().trim() },
      include: { student: { select: { id: true, name: true, courseId: true } } },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // Role must match the selected mode
    if (mode && user.role !== mode) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
    }

    // Admins always need password; students use code as password
    if (user.role === 'admin') {
      if (!password) {
        return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 })
      }
      const valid = await bcrypt.compare(String(password), user.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
      }
    }
    // Students: no password needed — code alone is the credential

    const token = await signToken({
      userId: user.id,
      role: user.role as 'admin' | 'student',
      studentId: user.studentId ?? undefined,
      code: user.code,
      fullName: user.fullName || user.student?.name || user.code,
    })

    const res = NextResponse.json({
      role: user.role,
      code: user.code,
      fullName: user.fullName || user.student?.name || user.code,
    })

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    })

    return res
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
