import { ArrowLeft, Play } from 'lucide-react'
import { Spinner }         from '@/components/ui/spinner'
import { TierTable }       from './TierTable'
import type { GameViewModel, LevelViewModel } from '../../domain/types'

interface Props {
  game:          GameViewModel
  levels:        LevelViewModel[]
  levelsLoading: boolean
  onBack:        () => void
  onPlay:        () => void
}

export function GameDetailPanel({ game: g, levels, levelsLoading, onBack, onPlay }: Props) {
  return (
    <div className="animate-in fade-in duration-200">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Games
      </button>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-4xl flex-shrink-0">
          {g.iconEmoji || '🎮'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-white leading-tight">{g.title}</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {g.description || 'No description available.'}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Levels"        value={String(g.maxLevels)} />
        <StatCard label="Coins (base)"  value={`${g.coinsPerLevelBase} coins`} />
        <StatCard label="Coins (max)"   value={`${g.coinsAtMaxLevel} coins`} />
        <StatCard label="Continue cost" value={`${g.continueCost} coins`} />
      </div>

      {/* Level tiers */}
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Level Tiers
      </h3>
      {levelsLoading
        ? <div className="flex justify-center py-8"><Spinner /></div>
        : <TierTable levels={levels} />
      }

      <div className="mt-6 flex justify-center">
        <button
          onClick={onPlay}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors"
        >
          <Play className="w-4 h-4 fill-white" />
          Play Now
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold text-white mt-0.5">{value}</div>
    </div>
  )
}
