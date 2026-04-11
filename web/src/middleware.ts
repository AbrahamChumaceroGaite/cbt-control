import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken }                              from '@/lib/auth'
import { COOKIE_NAME, PUBLIC_PATHS, STUDENT_ALLOWED_PATHS } from '@/config/auth'
import { ROLES }                                    from '@/config/roles'
import { APP_ROUTES }                               from '@/config/routes'

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

  const token   = request.cookies.get(COOKIE_NAME)?.value
  const session = token ? await verifyToken(token) : null

  if (!session) {
    const loginUrl = new URL(APP_ROUTES.LOGIN, request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (session.role === ROLES.STUDENT) {
    const allowed = STUDENT_ALLOWED_PATHS.some(p => pathname.startsWith(p))
    if (!allowed) {
      return NextResponse.redirect(new URL(APP_ROUTES.PORTAL, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // /ws is handled at the Node.js server level (upgrade event) — never reaches middleware
  matcher: ['/((?!_next/static|_next/image|favicon.ico|ws|.*\\.png$).*)'],
}
