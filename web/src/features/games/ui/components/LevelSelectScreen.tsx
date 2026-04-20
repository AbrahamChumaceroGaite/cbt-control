import { Lock, Play } from 'lucide-react'
import { cn }          from '@/lib/utils'
import type { GameViewModel, LevelViewModel } from '../../domain/types'

interface Props {
  game:        GameViewModel
  levels:      LevelViewModel[]
  maxUnlocked: number
  onSelect:    (level: number) => void
}

const TIER_COLORS: Record<string, string> = {
  Tutorial:  'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  Normal:    'border-sky-500/40 bg-sky-500/10 text-sky-300',
  Hard:      'border-amber-500/40 bg-amber-500/10 text-amber-300',
  Elite:     'border-orange-500/40 bg-orange-500/10 text-orange-300',
  Nightmare: 'border-red-500/40 bg-red-500/10 text-red-300',
  Inferno:   'border-rose-400/40 bg-rose-400/10 text-rose-300',
}

export function LevelSelectScreen({ game, levels, maxUnlocked, onSelect }: Props) {
  const coinsForLevel = (n: number) =>
    game.coinsPerLevelBase + (n - 1) * game.coinsPerLevelStep

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 shrink-0">
        <h2 className="text-lg font-bold text-white">Select Level</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Your progress is saved automatically.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {levels.length === 0 ? (
          <button
            onClick={() => onSelect(1)}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            Play
          </button>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
            {levels.map(level => {
              const locked  = level.number > maxUnlocked
              const tierCls = TIER_COLORS[level.tier] ?? TIER_COLORS.Tutorial
              const coins   = coinsForLevel(level.number)
              return (
                <button
                  key={level.id}
                  disabled={locked}
                  onClick={() => onSelect(level.number)}
                  title={locked ? 'Locked' : `Level ${level.number} — ${coins} coins`}
                  className={cn(
                    'relative flex flex-col items-center justify-center rounded-lg border p-2 text-xs font-bold transition-all',
                    locked
                      ? 'border-zinc-700 bg-zinc-900 text-zinc-600 cursor-not-allowed'
                      : cn(tierCls, 'hover:brightness-125 cursor-pointer'),
                    level.number === maxUnlocked && 'ring-2 ring-purple-500',
                  )}
                >
                  {locked
                    ? <Lock className="w-3 h-3" />
                    : <span>{level.number}</span>
                  }
                  {level.config.isBoss && !locked && (
                    <span className="absolute -top-1 -right-1 text-[8px]">👑</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
