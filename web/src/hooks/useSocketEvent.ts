import { DependencyList, useEffect } from 'react'
import { useSocket }   from '@/contexts/SocketContext'
import type { WsEvent, WsPayloads } from '@/socket/events'

export function useSocketEvent<E extends WsEvent>(
  event:   E,
  handler: (payload: WsPayloads[E]) => void,
  deps:    DependencyList = [],
): void {
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on(event, handler as any)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => { socket.off(event, handler as any) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, event, ...deps])
}
