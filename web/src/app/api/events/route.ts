import { NextRequest } from 'next/server'

/**
 * SSE proxy: streams events from NestJS to the browser.
 * Needed because Next.js rewrites may buffer text/event-stream responses.
 * This Route Handler explicitly pipes the body stream and sets correct headers.
 */
export async function GET(req: NextRequest) {
  const apiUrl = process.env.API_URL ?? 'http://localhost:4001'

  const upstream = await fetch(`${apiUrl}/api/events`, {
    headers: {
      cookie:  req.headers.get('cookie') ?? '',
      accept:  'text/event-stream',
      'cache-control': 'no-cache',
    },
  })

  return new Response(upstream.body, {
    status: upstream.ok ? 200 : upstream.status,
    headers: {
      'content-type':      'text/event-stream',
      'cache-control':     'no-cache',
      'x-accel-buffering': 'no',
    },
  })
}
