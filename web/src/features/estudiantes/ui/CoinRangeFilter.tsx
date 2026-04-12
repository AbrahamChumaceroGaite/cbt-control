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
  const active       = filters.coinMax !== null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-zinc-500">0</span>
        <span className="text-amber-400 font-bold">{effectiveMax} coins</span>
      </div>
      <input
        type="range" min={0} max={maxCoins} step={1} value={effectiveMax}
        onChange={e => {
          const v = parseInt(e.target.value)
          setFilters(p => ({ ...p, coinMax: v >= maxCoins ? null : v }))
        }}
        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
      />
      <p className="text-[10px] text-zinc-600 text-right">{count} student{count !== 1 ? 's' : ''}</p>
      {active && (
        <button onClick={onClear} className="text-[10px] text-zinc-500 hover:text-amber-400 text-right">
          Clear filter
        </button>
      )}
    </div>
  )
}
