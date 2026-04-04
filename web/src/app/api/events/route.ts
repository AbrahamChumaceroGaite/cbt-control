import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const api = process.env.API_URL ?? 'http://localhost:4001'

  const upstream = await fetch(`${api}/api/events`, {
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
