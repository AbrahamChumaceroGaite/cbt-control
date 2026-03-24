import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Control de Aula — TPdD',
  description: 'Sistema de gestión de puntos para Cambridge GP Stage 8',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
