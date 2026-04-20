import { Coins, ChevronRight } from 'lucide-react'
import type { CoinsEarned }    from '../../domain/types'

interface Props {
  data:      CoinsEarned
  onDismiss: () => void
}

export function CoinsOverlay({ data, onDismiss }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div
        className="pointer-events-auto animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center gap-3 rounded-2xl border border-amber-500/30 bg-zinc-950/95 px-8 py-6 shadow-2xl shadow-amber-500/10 backdrop-blur"
        onClick={onDismiss}
      >
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
          Level {data.level} complete!
        </div>
        <div className="flex items-center gap-2 text-amber-400 font-black text-3xl">
          <Coins className="w-7 h-7" />
          +{data.amount}
        </div>
        {data.newBalance > 0 && (
          <div className="text-xs text-zinc-400">
            Balance: <span className="text-amber-300 font-semibold">{data.newBalance} coins</span>
          </div>
        )}
        <button
          onClick={onDismiss}
          className="mt-1 flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
        >
          Continue <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
