import { TIER_RANGES } from '../../domain/types'
import type { LevelTier, LevelViewModel } from '../../domain/types'

interface Props {
  levels: LevelViewModel[]
}

const TIERS: LevelTier[] = ['Tutorial', 'Normal', 'Hard', 'Elite', 'Nightmare', 'Inferno']

export function TierTable({ levels }: Props) {
  if (levels.length === 0) {
    return <p className="text-xs text-zinc-500 py-4 text-center">No levels loaded.</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {TIERS.map(tier => {
        const range    = TIER_RANGES[tier]
        const hasBoss  = levels.some(l => l.tier === tier && l.config.isBoss)
        const count    = levels.filter(l => l.tier === tier).length
        if (count === 0) return null
        return (
          <div
            key={tier}
            className={`rounded-lg border px-3 py-2 ${range.color}`}
          >
            <div className="text-xs font-bold">{tier}</div>
            <div className="text-[10px] opacity-70 mt-0.5">
              Levels {range.from}–{range.to}
              {hasBoss && <span className="ml-1 font-bold">· Boss</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
