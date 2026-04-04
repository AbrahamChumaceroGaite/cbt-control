'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SocketContext = createContext<Socket | null>(null)

export function useSocket() {
  return useContext(SocketContext)
}

/**
 * Fetches a short-lived WS token from /api/auth/ws-token (reads the httpOnly
 * session cookie server-side) then opens a socket.io connection.
 *
 * Place this provider at the root of any page that needs real-time updates.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    let s: Socket | undefined

    fetch('/api/auth/ws-token')
      .then(r => (r.ok ? r.json() : null))
      .then((body: { data?: { token: string } } | null) => {
        const token = body?.data?.token
        if (!token) return

        // In dev: NEXT_PUBLIC_WS_URL = http://localhost:4001
        // In prod (nginx): same origin, nginx proxies /socket.io/
        const url = process.env.NEXT_PUBLIC_WS_URL ?? ''
        s = io(url, {
          auth:              { token },
          reconnection:      true,
          reconnectionDelay: 3000,
          transports:        ['websocket', 'polling'],
        })
        setSocket(s)
      })
      .catch(() => {/* session not active — silently skip */})

    return () => { s?.disconnect() }
  }, [])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
