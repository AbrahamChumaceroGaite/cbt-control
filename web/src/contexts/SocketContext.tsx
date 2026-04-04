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
    const s = io('', {
      path:              '/socket.io',   // fuera del prefijo /api → Express no lo intercepta
      transports:        ['polling'],    // polling funciona a través del proxy HTTP de Next.js
      withCredentials:   true,
      reconnection:      true,
      reconnectionDelay: 3000,
    })
    setSocket(s)
    return () => { s.disconnect() }
  }, [])

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
}
