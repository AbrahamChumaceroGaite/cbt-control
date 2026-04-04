import { NextRequest } from 'next/server'

/**
 * SSE proxy: forwards the browser's request to the NestJS API and streams
 * the response back. The httpOnly cookie is forwarded automatically so the
 * API can authenticate via JwtAuthGuard.
 *
 * Browser → GET /api/events → (this handler) → GET http://api:4001/api/events
 */
export async function GET(req: NextRequest) {
  const apiUrl = process.env.API_URL ?? 'http://localhost:4001'
  const upstream = await fetch(`${apiUrl}/api/events`, {
    headers: {
      cookie:  req.headers.get('cookie') ?? '',
      accept:  'text/event-stream',
      'cache-control': 'no-cache',
    },
    // @ts-expect-error — Node 18+ fetch supports duplex streaming
    duplex: 'half',
  })

  if (!upstream.ok) {
    return new Response(upstream.body, { status: upstream.status })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'content-type':      'text/event-stream',
      'cache-control':     'no-cache',
      'x-accel-buffering': 'no',
      connection:          'keep-alive',
    },
  })
}
