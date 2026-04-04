'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { WsEvent, WsPayloads } from '@/socket/events'

type Handler<E extends WsEvent> = (payload: WsPayloads[E]) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = Handler<any>

interface SseContextValue {
  subscribe:   <E extends WsEvent>(event: E, handler: Handler<E>) => () => void
}

const SseContext = createContext<SseContextValue | null>(null)

export function useSse() {
  const ctx = useContext(SseContext)
  if (!ctx) throw new Error('useSse must be used inside SseProvider')
  return ctx
}

/**
 * Connects to /api/events (SSE) and fans out incoming messages to subscribers
 * registered by event name. The route.ts handler proxies to NestJS; the
 * httpOnly cookie is forwarded so authentication works automatically.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  // Map<eventName, Set<handler>>
  const listenersRef = useRef<Map<string, Set<AnyHandler>>>(new Map())
  const [, forceRender] = useState(0)

  useEffect(() => {
    let es: EventSource
    let retryTimer: ReturnType<typeof setTimeout>

    function connect() {
      es = new EventSource('/api/events', { withCredentials: true })

      es.onmessage = (e: MessageEvent<string>) => {
        try {
          const { event, data } = JSON.parse(e.data) as { event: string; data: unknown }
          listenersRef.current.get(event)?.forEach(h => h(data))
        } catch { /* ignore parse errors */ }
      }

      es.onerror = () => {
        es.close()
        retryTimer = setTimeout(connect, 4000)
      }
    }

    connect()
    // trigger re-render so context value is stable (avoids stale closure)
    forceRender(n => n + 1)

    return () => {
      clearTimeout(retryTimer)
      es?.close()
    }
  }, [])

  const subscribe = <E extends WsEvent>(event: E, handler: Handler<E>): (() => void) => {
    const map = listenersRef.current
    if (!map.has(event)) map.set(event, new Set())
    map.get(event)!.add(handler as AnyHandler)
    return () => {
      map.get(event)?.delete(handler as AnyHandler)
      if (map.get(event)?.size === 0) map.delete(event)
    }
  }

  return (
    <SseContext.Provider value={{ subscribe }}>
      {children}
    </SseContext.Provider>
  )
}
