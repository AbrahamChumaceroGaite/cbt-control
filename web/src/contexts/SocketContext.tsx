'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SocketContext = createContext<Socket | null>(null)

export function useSocket() {
  return useContext(SocketContext)
}

/**
 * Connects to the NestJS socket.io gateway via HTTP long-polling.
 *
 * The gateway path is /api/socket.io — this falls inside Next.js's rewrite
 * rule (/api/* → api:4001/api/*), so no extra proxy or nginx is needed.
 * The httpOnly session cookie is sent automatically on every polling request.
 *
 * WebSocket transport is intentionally disabled: WebSocket upgrades require
 * the intermediate proxy (Coolify/Traefik) to support them, which it may not.
 * Long-polling has the same real-time characteristics for this use case.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const s = io('', {
      path:              '/api/socket.io',
      transports:        ['polling'],   // no WebSocket — works through any HTTP proxy
      withCredentials:   true,          // send the cbt_session cookie
      reconnection:      true,
      reconnectionDelay: 3000,
    })
    setSocket(s)
    return () => { s.disconnect() }
  }, [])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
