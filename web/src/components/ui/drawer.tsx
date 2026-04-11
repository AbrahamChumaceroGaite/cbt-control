'use client'
import * as React from 'react'
import { X }      from 'lucide-react'
import { cn }     from '@/lib/utils'
import { Button } from './button'

interface DrawerProps {
  open:      boolean
  onClose:   () => void
  title?:    string
  children:  React.ReactNode
  side?:     'left' | 'right'
  className?: string
}

export function Drawer({ open, onClose, title, children, side = 'right', className }: DrawerProps) {
  // Trap ESC key
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop — z-[var(--z-drawer)] as Tailwind JIT arbitrary value */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-drawer)]"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 h-full w-full max-w-sm bg-zinc-950 border-zinc-800 flex flex-col z-[var(--z-drawer)]',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          className,
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
          <Button variant="ghost" size="icon" onClick={onClose} className="ml-auto w-8 h-8 text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </>
  )
}
