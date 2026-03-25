/**
 * Server-side session helpers — Node.js only (uses next/headers + prisma).
 * Do NOT import this in middleware (edge runtime).
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME, type SessionPayload } from './auth'

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

/** Returns a NextResponse error if NOT admin, or null if the request is allowed. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Acceso prohibido' }, { status: 403 })
  }
  return null
}

/** Returns a NextResponse error if NOT authenticated, or null if allowed. */
export async function requireAuth(): Promise<NextResponse | null> {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  return null
}
