import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'demo'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          default: 'bg-zinc-800 text-zinc-400',
          green:   'bg-emerald-950 text-emerald-400 border border-emerald-900',
          amber:   'bg-amber-950 text-amber-400 border border-amber-900',
          red:     'bg-red-950 text-red-400 border border-red-900',
          blue:    'bg-blue-950 text-blue-400 border border-blue-900',
          violet:  'bg-violet-950 text-violet-400 border border-violet-900',
          demo:    'bg-violet-950 text-violet-400 border border-violet-900',
        }[variant],
        className
      )}
      {...props}
    />
  )
}
