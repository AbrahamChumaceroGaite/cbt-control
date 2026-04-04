import { DependencyList, useEffect } from 'react'
import { useSse }         from '@/contexts/SocketContext'
import type { WsEvent, WsPayloads } from '@/socket/events'

export function useSocketEvent<E extends WsEvent>(
  event:   E,
  handler: (payload: WsPayloads[E]) => void,
  deps:    DependencyList = [],
): void {
  const { subscribe } = useSse()

  useEffect(() => {
    return subscribe(event, handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps])
}
