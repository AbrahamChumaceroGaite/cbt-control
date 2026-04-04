'use client'
import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import type { WsEvent, WsPayloads } from '@/socket/events'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = (payload: any) => void

interface SseCtx {
  subscribe: <E extends WsEvent>(event: E, handler: (payload: WsPayloads[E]) => void) => () => void
}

const Ctx = createContext<SseCtx | null>(null)

export function useSocket() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSocket must be inside SocketProvider')
  return ctx
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const listeners = useRef(new Map<string, Set<AnyHandler>>())

  useEffect(() => {
    let es: EventSource
    let timer: ReturnType<typeof setTimeout>

    function connect() {
      es = new EventSource('/api/events', { withCredentials: true })
      es.onmessage = (e: MessageEvent<string>) => {
        try {
          const { event, data } = JSON.parse(e.data)
          listeners.current.get(event)?.forEach(h => h(data))
        } catch { /* ignore */ }
      }
      es.onerror = () => { es.close(); timer = setTimeout(connect, 4000) }
    }

    connect()
    return () => { clearTimeout(timer); es?.close() }
  }, [])

  const subscribe = useCallback(<E extends WsEvent>(
    event: E,
    handler: (payload: WsPayloads[E]) => void,
  ) => {
    const map = listeners.current
    if (!map.has(event)) map.set(event, new Set())
    map.get(event)!.add(handler)
    return () => { map.get(event)?.delete(handler) }
  }, [])

  return <Ctx.Provider value={{ subscribe }}>{children}</Ctx.Provider>
}
