import * as React from 'react'
import { cn } from '@/lib/utils'

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'flex h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-zinc-500',
        className
      )}
      {...props}
    />
  )
}
