/**
 * JWT utilities — edge-safe (jose only).
 * Only used by middleware to verify session tokens.
 * Token signing happens exclusively in the NestJS API.
 */
import { jwtVerify } from 'jose'
import type { SessionPayload } from '@control-aula/shared'

export type { SessionPayload }

export const COOKIE_NAME = 'cbt_session'
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'cbt-dev-secret-change-in-prod')

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
