import * as React from 'react'
import { cn } from '@/lib/utils'

export function Tooltip({ children, content, side = 'top' }: {
  children: React.ReactNode
  content: string
  side?: 'top' | 'bottom'
}) {
  return (
    <div className="relative group/tip inline-flex">
      {children}
      <div className={cn(
        'absolute left-1/2 -translate-x-1/2 z-50 px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 whitespace-nowrap pointer-events-none shadow-lg',
        'opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 delay-300',
        side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
      )}>
        {content}
        {side === 'top'
          ? <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
          : <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-zinc-800" />}
      </div>
    </div>
  )
}
