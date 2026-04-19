import { cn } from '@/lib/utils'
import type { GameViewModel } from '../../domain/types'

interface Props {
  game:     GameViewModel
  onSelect: (game: GameViewModel) => void
}

export function GameCard({ game: g, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(g)}
      className={cn(
        'group text-left w-full card-base p-0 overflow-hidden',
        'transition-all hover:border-zinc-500 hover:shadow-lg hover:shadow-black/40',
        !g.isActive && 'opacity-50 cursor-not-allowed',
      )}
      disabled={!g.isActive}
    >
      {/* Cover area */}
      <div className="h-32 bg-zinc-900 flex items-center justify-center border-b border-zinc-800 relative overflow-hidden">
        <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-300">
          {g.iconEmoji || '🎮'}
        </span>
        {g.isActive && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-white text-sm leading-tight mb-1">{g.title}</h3>
        <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
          {g.description || 'No description available.'}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span className="px-1.5 py-0.5 rounded bg-zinc-800">{g.maxLevels} levels</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {g.coinsPerLevelBase}–{g.coinsAtMaxLevel} coins
          </span>
        </div>
      </div>
    </button>
  )
}
