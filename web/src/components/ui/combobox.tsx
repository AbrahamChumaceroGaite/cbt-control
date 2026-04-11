'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search }  from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ComboboxOption {
  value: string
  label: string
}

interface Props {
  value:        string
  onChange:     (value: string) => void
  options:      ComboboxOption[]
  placeholder?: string
  className?:   string
  size?:        'sm' | 'default'
  disabled?:    boolean
}

export function Combobox({
  value, onChange, options,
  placeholder = 'Seleccionar…',
  className, size = 'sm', disabled = false,
}: Props) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const ref      = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find(o => o.value === value)
  const filtered = query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setQuery('')
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function toggle() {
    if (disabled) return
    setOpen(o => {
      if (!o) setTimeout(() => inputRef.current?.focus(), 0)
      return !o
    })
    setQuery('')
  }

  const sm = size === 'sm'

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 text-white focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-zinc-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
          sm ? 'h-8 px-2.5 gap-1.5 text-xs' : 'h-10 px-3 gap-2 text-sm'
        )}
      >
        <span className={cn('truncate', selected ? 'text-white' : 'text-zinc-500')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={cn(
          'flex-shrink-0 text-zinc-500 transition-transform duration-150',
          open && 'rotate-180',
          sm ? 'w-3 h-3' : 'w-4 h-4'
        )} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[160px] rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/60 overflow-hidden">
          <div className="p-1.5 border-b border-zinc-800">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800/80">
              <Search className="w-3 h-3 text-zinc-500 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') { setOpen(false); setQuery('') }
                  if (e.key === 'Enter' && filtered.length === 1) {
                    onChange(filtered[0].value); setOpen(false); setQuery('')
                  }
                }}
                placeholder="Buscar…"
                className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-xs text-zinc-500 text-center">Sin resultados</p>
            ) : filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); setQuery('') }}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors',
                  o.value === value
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-300 hover:bg-zinc-800/70 hover:text-white'
                )}
              >
                <span className="truncate text-left text-xs">{o.label}</span>
                {o.value === value && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-2" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
