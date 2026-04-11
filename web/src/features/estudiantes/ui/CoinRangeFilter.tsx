import type { StudentFilters } from '../domain/types'

interface Props {
  filters:    StudentFilters
  maxCoins:   number
  count:      number
  setFilters: (fn: (p: StudentFilters) => StudentFilters) => void
  onClear:    () => void
}

export function CoinRangeFilter({ filters, maxCoins, count, setFilters, onClear }: Props) {
  const effectiveMax = filters.coinMax ?? maxCoins
  const active       = filters.coinMin > 0 || filters.coinMax !== null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-amber-400 font-bold">{filters.coinMin}</span>
        <span className="text-zinc-600">—</span>
        <span className="text-amber-400 font-bold">{effectiveMax}</span>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Mínimo: {filters.coinMin}</span>
        <input type="range" min={0} max={maxCoins} step={1} value={filters.coinMin}
          onChange={e => {
            const v = parseInt(e.target.value)
            setFilters(p => ({ ...p, coinMin: v, coinMax: p.coinMax !== null && v > p.coinMax ? v : p.coinMax }))
          }}
          className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500" />
      </div>
      <div className="space-y-1">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Máximo: {effectiveMax}</span>
        <input type="range" min={0} max={maxCoins} step={1} value={effectiveMax}
          onChange={e => {
            const v = parseInt(e.target.value)
            setFilters(p => ({ ...p, coinMax: v >= maxCoins ? null : v, coinMin: v < p.coinMin ? v : p.coinMin }))
          }}
          className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500" />
      </div>
      <p className="text-[10px] text-zinc-600 text-right">{count} alumno{count !== 1 ? 's' : ''}</p>
      {active && (
        <button onClick={onClear} className="text-[10px] text-zinc-500 hover:text-amber-400 text-right">
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
