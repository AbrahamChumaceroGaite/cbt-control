'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SocketContext = createContext<Socket | null>(null)

export function useSocket() {
  return useContext(SocketContext)
}

/**
 * Opens a socket.io connection using the httpOnly session cookie.
 * The browser sends the cookie automatically on the WebSocket upgrade
 * request and on XHR polling — no separate token fetch needed.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // In dev: NEXT_PUBLIC_WS_URL = http://localhost:4001
    // In prod (nginx proxies /socket.io/): leave empty → same origin
    const url = process.env.NEXT_PUBLIC_WS_URL ?? ''
    const s = io(url, {
      withCredentials:   true,   // send the cbt_session cookie
      reconnection:      true,
      reconnectionDelay: 3000,
      transports:        ['websocket', 'polling'],
    })
    setSocket(s)
    return () => { s.disconnect() }
  }, [])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
