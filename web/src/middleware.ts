import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/jwt'

const PUBLIC_PATHS = ['/login', '/api/auth/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(png|jpg|svg|ico|css|js)$/)
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  const session = token ? await verifyToken(token) : null

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (session.role === 'student') {
    const allowed =
      pathname.startsWith('/portal') ||
      pathname.startsWith('/api/portal') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/notifications') ||
      pathname.startsWith('/api/push') ||
      pathname.startsWith('/ws')
    if (!allowed) {
      return NextResponse.redirect(new URL('/portal', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // /ws is handled at the Node.js server level (upgrade event) — never reaches middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico|ws|.*\\.png$).*)'],
}
