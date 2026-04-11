import { cn }                         from '@/lib/utils'
import { Label }                        from './label'
import { EFFECT_LEVEL, effectLevelKey } from '@/config/scheme'

interface SliderProps {
  label:        string
  value:        number
  min:          number
  max:          number
  step?:        number
  unit?:        string
  onChange:     (v: number) => void
  effectPct?:   number
  effectLabel?: string
}

export function SliderField({ label, value, min, max, step = 0.1, unit = '', onChange, effectPct, effectLabel }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {effectPct !== undefined && (() => {
            const lvl = EFFECT_LEVEL[effectLevelKey(effectPct)]
            return (
              <span className={cn('text-xs font-mono px-2 py-0.5 rounded-full', lvl.bg, lvl.text)}>
                {effectPct}%
              </span>
            )
          })()}
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
