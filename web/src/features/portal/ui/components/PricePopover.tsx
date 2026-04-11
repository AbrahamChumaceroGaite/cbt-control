'use client'
import { useState, useEffect, useRef } from 'react'
import { SlidersHorizontal, X }        from 'lucide-react'

interface Props {
  maxPrice: number
  value:    number | null
  onChange: (v: number) => void
  onClear:  () => void
}

export function PricePopover({ maxPrice, value, onChange, onClear }: Props) {
  const [open, setOpen] = useState(false)
  const ref    = useRef<HTMLDivElement>(null)
  const active = value !== null && value < maxPrice

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-semibold transition-colors flex-shrink-0 ${
          active
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        {active ? `≤${value}c` : 'Precio'}
        {active && (
          <X className="w-3 h-3 ml-0.5" onClick={e => { e.stopPropagation(); onClear(); setOpen(false) }} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-2xl shadow-black/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-500">Precio máximo</span>
            <span className="font-mono text-xs font-bold text-amber-400">{value ?? maxPrice}</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={1}
            value={value ?? maxPrice}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-zinc-700
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:mt-[-5px]
              [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(251,191,36,0.5)]"
          />
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>0</span><span>{maxPrice} coins</span>
          </div>
          {active && (
            <button onClick={() => { onClear(); setOpen(false) }}
              className="w-full h-7 rounded-lg text-xs text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors border border-zinc-800">
              Limpiar filtro
            </button>
          )}
        </div>
      )}
    </div>
  )
}
