import { CheckCircle2 } from 'lucide-react'
import { Button }       from '@/components/ui'
import type { IndividualReward } from '../../domain/types'

const ACCENTS = [
  'border-l-4 border-amber-400/70',
  'border-l-4 border-purple-400/50',
  'border-l-4 border-emerald-400/50',
]

interface Props {
  reward:        IndividualReward
  globalIndex:   number
  isFeatured:    boolean
  canAfford:     boolean
  alreadyPending: boolean
  requesting:    string | null
  onAskConfirm:  (reward: IndividualReward, salePrice: number) => void
}

export function PortalRewardCard({ reward: r, globalIndex, isFeatured, canAfford, alreadyPending, requesting, onAskConfirm }: Props) {
  const accent = ACCENTS[globalIndex % ACCENTS.length]

  return (
    <div className={`group rounded-xl p-4 transition-all duration-300 ${accent} ${
      isFeatured ? 'col-span-2 flex gap-4' : 'flex flex-col'
    } ${canAfford ? 'bg-zinc-900/80 hover:bg-zinc-800/90' : 'bg-zinc-900/40 opacity-60'}`}>
      <div className={`bg-zinc-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isFeatured ? 'w-14 h-14 self-center' : 'w-11 h-11 mb-3'}`}>
        {r.icon}
      </div>
      <div className={isFeatured ? 'flex-1 min-w-0' : ''}>
        {isFeatured && (
          <span className="text-amber-400 font-bold text-sm float-right">{r.coinsRequired}c</span>
        )}
        <h3 className={`text-zinc-100 font-bold leading-tight ${isFeatured ? 'text-base mb-1' : 'text-sm mb-1'}`}>{r.name}</h3>
        {r.description && (
          <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed mb-3">{r.description}</p>
        )}
        {!isFeatured && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-amber-400 font-bold text-xs">{r.coinsRequired} c</span>
          </div>
        )}
        {alreadyPending ? (
          <Button disabled variant="secondary" className={`${isFeatured ? 'mt-2' : ''} w-full py-2 h-auto rounded-xl cursor-default`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sent
          </Button>
        ) : (
          <Button
            variant={canAfford ? 'amber' : 'secondary'}
            disabled={!canAfford || !!requesting}
            loading={requesting === r.id}
            onClick={() => canAfford && !requesting && onAskConfirm(r, r.coinsRequired)}
            className={`${isFeatured ? 'mt-2' : ''} w-full py-2 h-auto rounded-xl active:scale-95 ${!canAfford ? 'cursor-not-allowed' : ''}`}
          >
            {canAfford ? 'Request' : 'Not enough coins'}
          </Button>
        )}
      </div>
    </div>
  )
}
