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
    // NEXT_PUBLIC_API_URL apunta al dominio público del API (configurado en Coolify).
    // En desarrollo: http://localhost:4001
    // En producción: https://api-control-cbt.prod.dtt.tja.ucb.edu.bo (o el dominio configurado)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001'

    const s = io(apiUrl, {
      path:            '/socket.io',
      transports:      ['websocket', 'polling'],
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
