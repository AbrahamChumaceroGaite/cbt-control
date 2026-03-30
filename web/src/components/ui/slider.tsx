import { cn } from '@/lib/utils'
import { Label } from './label'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
  effectPct?: number
  effectLabel?: string
}

export function SliderField({ label, value, min, max, step = 0.1, unit = '', onChange, effectPct, effectLabel }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {effectPct !== undefined && (
            <span className={cn(
              'text-xs font-mono px-2 py-0.5 rounded-full',
              effectPct >= 80 ? 'bg-emerald-950 text-emerald-400' :
              effectPct >= 50 ? 'bg-amber-950 text-amber-400' :
              'bg-red-950 text-red-400'
            )}>{effectPct}%</span>
          )}
          <span className="text-sm font-mono text-white tabular-nums">{value}{unit}</span>
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-white"
      />
      {effectLabel && <p className="text-xs text-zinc-500">{effectLabel}</p>}
    </div>
  )
}
