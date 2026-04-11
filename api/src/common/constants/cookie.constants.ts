/** HTTP-only session cookie name — must match the frontend config/auth.ts COOKIE_NAME */
export const COOKIE_NAME = 'cbt_session'
export const COOKIE_OPTS = {
  httpOnly: true,
  path:     '/',
  sameSite: 'lax' as const,
  maxAge:   8 * 60 * 60 * 1000,
} as const
