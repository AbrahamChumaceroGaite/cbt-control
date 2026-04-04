import { DependencyList, useEffect } from 'react'
import { useWs } from '@/contexts/SocketContext'
import type { WsEvent, WsPayloads } from '@/ws/events'

export function useSocketEvent<E extends WsEvent>(
  event:   E,
  handler: (payload: WsPayloads[E]) => void,
  deps:    DependencyList = [],
): void {
  const { on } = useWs()

  useEffect(
    () => on(event, handler as (d: unknown) => void),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [event, ...deps],
  )
}
