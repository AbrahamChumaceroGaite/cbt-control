'use client'
import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  open:      boolean
  onClose:   () => void
  title?:    string
  children:  React.ReactNode
  side?:     'left' | 'right'
  className?: string
}

export function Drawer({ open, onClose, title, children, side = 'right', className }: DrawerProps) {
  // Trap focus and ESC key
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: 'var(--z-drawer)' as unknown as number }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 h-full w-full max-w-sm bg-zinc-950 border-zinc-800 flex flex-col',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          className,
        )}
        style={{ zIndex: 'var(--z-drawer)' as unknown as number }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
          <button onClick={onClose} className="ml-auto text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </>
  )
}
