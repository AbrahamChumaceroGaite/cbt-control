import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CBT Home Room',
  description: 'Sistema de Desempeño y Rewards — CBT Home Room',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">{children}</body>
    </html>
  )
}
