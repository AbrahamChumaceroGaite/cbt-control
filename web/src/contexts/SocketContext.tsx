'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SocketContext = createContext<Socket | null>(null)

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Same-origin: el browser conecta a su propio dominio.
    // Next.js reescribe /socket.io/* → http://api:4001/socket.io/* internamente.
    // polling evita el WebSocket upgrade que los proxies HTTP no manejan bien.
    const s = io('', {
      path:            '/socket.io',
      transports:      ['polling'],
      withCredentials: true,
      reconnection:    true,
      reconnectionDelay: 3000,
    })

    s.on('connect',       () => console.debug('[ws] connected'))
    s.on('disconnect',    () => console.debug('[ws] disconnected'))
    s.on('connect_error', (e) => console.warn('[ws] error:', e.message))

    setSocket(s)
    return () => { s.disconnect() }
  }, [])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
