'use client'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value:         string
  onChange:      (v: string) => void
  placeholder?:  string
  className?:    string
  disabled?:     boolean
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className, disabled }: Props) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-9 pl-8 pr-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  )
}
