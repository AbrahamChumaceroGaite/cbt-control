export const COOKIE_NAME = 'cbt_session'

export const PUBLIC_PATHS = ['/login', '/api/auth/login'] as const

export const STUDENT_ALLOWED_PATHS = [
  '/portal',
  '/api/portal',
  '/api/auth',
  '/api/notifications',
  '/api/push',
  '/api/bank',
  '/api-games',
  '/games',
] as const
