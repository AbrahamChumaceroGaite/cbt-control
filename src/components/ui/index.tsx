'use client'
import * as React from 'react'
import { cn } from '@/lib/utils'

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive' | 'secondary' | 'amber'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}
export function Button({ className, variant = 'default', size = 'md', ...props }: ButtonProps) {
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
        { sm: 'h-8 px-3 text-xs gap-1.5', md: 'h-9 px-4 text-sm gap-2', lg: 'h-11 px-6 text-base gap-2', icon: 'h-9 w-9' }[size],
        className
      )}
      {...props}
    />
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'green' | 'amber' | 'red' | 'blue' | 'violet'
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
        }[variant],
        className
      )}
      {...props}
    />
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
