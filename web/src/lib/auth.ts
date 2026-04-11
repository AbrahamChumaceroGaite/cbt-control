/**
 * Edge-safe JWT utilities — uses jose only (no Node.js crypto).
 * Only middleware.ts imports this file.
 * Token signing happens exclusively in the NestJS API.
 */
import { jwtVerify } from 'jose'
import type { SessionPayload } from '@control-aula/shared'
import { COOKIE_NAME } from '@/config/auth'

export { COOKIE_NAME }

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'cbt-dev-secret-change-in-prod',
)

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
