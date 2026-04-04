'use client'
import { createContext, useCallback, useContext, useEffect, useRef } from 'react'

type Handler = (data: unknown) => void

interface WsCtx {
  on: (event: string, handler: Handler) => () => void
}

const Ctx = createContext<WsCtx | null>(null)

export function useSse(): WsCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSse outside SocketProvider')
  return ctx
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const listeners = useRef<Map<string, Set<Handler>>>(new Map())

  useEffect(() => {
    let ws: WebSocket
    let retryTimer: ReturnType<typeof setTimeout>
    let dead = false

    function connect() {
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
      const url   = `${proto}//${location.host}/ws`
      console.log('[ws] connecting to', url)
      ws = new WebSocket(url)

      ws.onopen  = () => console.log('[ws] connected')

      ws.onmessage = ({ data }) => {
        try {
          const { event, data: payload } = JSON.parse(data)
          listeners.current.get(event)?.forEach(h => h(payload))
        } catch { /* ignore malformed frames */ }
      }

      ws.onerror = () => console.warn('[ws] error — see close event for details')

      ws.onclose = ({ code, reason, wasClean }) => {
        console.warn(`[ws] closed  code=${code}  clean=${wasClean}  reason=${reason || '—'}`)
        if (!dead) {
          console.log('[ws] reconnecting in 3s...')
          retryTimer = setTimeout(connect, 3000)
        }
      }
    }

    connect()
    return () => { dead = true; clearTimeout(retryTimer); ws?.close() }
  }, [])

  const on = useCallback((event: string, handler: Handler) => {
    const map = listeners.current
    if (!map.has(event)) map.set(event, new Set())
    map.get(event)!.add(handler)
    return () => {
      map.get(event)?.delete(handler)
      if (map.get(event)?.size === 0) map.delete(event)
    }
  }, [])

  return <Ctx.Provider value={{ on }}>{children}</Ctx.Provider>
}
