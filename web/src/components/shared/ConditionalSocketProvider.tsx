'use client'
import { usePathname } from 'next/navigation'
import { SocketProvider } from '@/contexts/SocketContext'

export function ConditionalSocketProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/login')) return <>{children}</>
  return <SocketProvider>{children}</SocketProvider>
}
