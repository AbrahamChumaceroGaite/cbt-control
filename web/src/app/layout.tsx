import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConditionalSocketProvider } from '@/components/shared/ConditionalSocketProvider'
import { ToastContainer }            from '@/components/ui'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'CBT Home Room',
  description: 'CBT Home Room — Performance & Rewards System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-zinc-950 text-zinc-100 antialiased min-h-screen`}>
        <ConditionalSocketProvider>{children}</ConditionalSocketProvider>
        <ToastContainer />
      </body>
    </html>
  )
}
