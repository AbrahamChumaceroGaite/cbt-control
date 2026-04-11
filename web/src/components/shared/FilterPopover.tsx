'use client'
import * as React from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Popover } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FilterPopoverProps {
  active?:   boolean   // true if any filter is applied (highlights button)
  onClear?:  () => void
  children:  React.ReactNode
  className?: string
}

export function FilterPopover({ active, onClear, children, className }: FilterPopoverProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      align="right"
      trigger={
        <Button
          variant={active ? 'amber' : 'outline'}
          size="sm"
          onClick={() => setOpen(o => !o)}
          className={cn('gap-1.5', active && 'ring-1 ring-amber-400/40')}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
          {active && <span className="w-1.5 h-1.5 rounded-full bg-amber-900" />}
        </Button>
      }
      className={className}
    >
      <div className="flex flex-col gap-3">
        {children}
        {active && onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { onClear(); setOpen(false) }}
            className="h-auto px-0 py-0 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-transparent gap-1.5 mt-1"
          >
            <X className="w-3 h-3" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </Popover>
  )
}
