import { DependencyList, useEffect } from 'react'
import { useSocket } from '@/contexts/SocketContext'
import type { WsEvent, WsPayloads } from '@/socket/events'

export function useSocketEvent<E extends WsEvent>(
  event:   E,
  handler: (payload: WsPayloads[E]) => void,
  deps:    DependencyList = [],
): void {
  const { subscribe } = useSocket()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => subscribe(event, handler), [event, ...deps])
}
