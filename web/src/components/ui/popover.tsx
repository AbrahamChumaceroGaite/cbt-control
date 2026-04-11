'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface PopoverProps {
  open:      boolean
  onClose:   () => void
  trigger:   React.ReactNode
  children:  React.ReactNode
  align?:    'left' | 'right'
  className?: string
}

export function Popover({ open, onClose, trigger, children, align = 'right', className }: PopoverProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  return (
    <div ref={ref} className="relative">
      {trigger}
      {open && (
        <div
          className={cn(
            'absolute top-full mt-2 z-[var(--z-dropdown)] min-w-[220px]',
            'rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl p-4',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
          style={{ zIndex: 'var(--z-dropdown)' as unknown as number }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
