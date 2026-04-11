'use client'
import { useState } from 'react'
import { CalendarDays, X } from 'lucide-react'
import type { DateFilter } from '../../domain/types'

interface Props {
  filter:      DateFilter | null
  onApply:     (f: DateFilter) => void
  onClear:     () => void
  placeholder?: string
}

export function DateFilterPopover({ filter, onApply, onClear, placeholder = 'Fecha' }: Props) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(filter?.from ?? '')
  const [to,   setTo]   = useState(filter?.to   ?? '')
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          filter
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <CalendarDays className="w-3 h-3" />
        {filter ? `${filter.from} → ${filter.to}` : placeholder}
        {filter && (
          <X className="w-3 h-3 ml-0.5" onClick={e => { e.stopPropagation(); setFrom(''); setTo(''); onClear(); setOpen(false) }} />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-60 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-2xl p-3 space-y-2.5">
          <div className="space-y-1">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider">Desde</label>
            <input type="date" value={from} max={today} onChange={e => setFrom(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider">Hasta</label>
            <input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setFrom(''); setTo(''); onClear(); setOpen(false) }}
              className="flex-1 h-8 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
              Limpiar
            </button>
            <button onClick={() => { if (from) { onApply({ from, to: to || today }); setOpen(false) } }} disabled={!from}
              className="flex-1 h-8 rounded-lg bg-amber-500 text-zinc-900 text-xs font-bold hover:bg-amber-400 disabled:opacity-40 transition-colors">
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
