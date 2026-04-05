import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive' | 'secondary' | 'amber'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

export function Button({ className, variant = 'default', size = 'sm', loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        {
          default:     'bg-white text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200',
          ghost:       'text-zinc-400 hover:text-white hover:bg-zinc-800',
          outline:     'border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white',
          destructive: 'bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-900',
          secondary:   'bg-zinc-800 text-zinc-300 hover:bg-zinc-700',
          amber:       'bg-amber-500 text-zinc-900 hover:bg-amber-400 font-semibold',
        }[variant],
        { sm: 'h-8 px-3 text-xs gap-1.5', md: 'h-9 px-4 text-sm gap-2', lg: 'h-11 px-6 text-base gap-2', icon: 'h-8 w-8' }[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  )
}
