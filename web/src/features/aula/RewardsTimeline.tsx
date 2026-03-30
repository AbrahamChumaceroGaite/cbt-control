import { Trophy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RewardResponse, CoinLogResponse } from '@control-aula/shared'

interface RewardsTimelineProps {
  timelineRewards: RewardResponse[]
  currentCoins: number
  nextReward: RewardResponse | undefined
  logs: CoinLogResponse[]
  onClaim: (reward: RewardResponse) => void
}

export function RewardsTimeline({ timelineRewards, currentCoins, nextReward, logs, onClaim }: RewardsTimelineProps) {
  return (
    <div className="card-base p-6 relative group overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-all" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 relative z-10 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" /> Gran Ruta de Recompensas
          </h3>
          <p className="text-sm font-medium mt-1 text-zinc-300">
            {nextReward
              ? <span>Próximo desbloqueo: <strong className="text-emerald-400">{nextReward.icon} {nextReward.name}</strong> a los {nextReward.coinsRequired} coins</span>
              : <strong className="text-emerald-400">¡Han superado todas las metas globales configuradas!</strong>}
          </p>
        </div>
        <div className="text-right whitespace-nowrap bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl shadow-inner">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">{currentCoins}</span>
          <span className="text-zinc-500 font-bold ml-2 text-sm uppercase tracking-wider">coins</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto overflow-y-hidden pb-4 pt-10 mt-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <div className="flex items-center min-w-max pb-20">
          {timelineRewards.map((r, i) => {
            const isReached      = currentCoins >= r.coinsRequired
            const isNext         = nextReward?.id === r.id
            const isAlreadyClaimed = logs.some(l => l.reason === `🎁 Canjeado: ${r.name}`)
            const canClaim       = isReached && r.id !== 'start' && !isAlreadyClaimed
            const nextR          = timelineRewards[i + 1]
            let segmentFill = 0
            if (nextR) {
              if (currentCoins >= nextR.coinsRequired) segmentFill = 100
              else if (currentCoins > r.coinsRequired)
                segmentFill = ((currentCoins - r.coinsRequired) / (nextR.coinsRequired - r.coinsRequired)) * 100
            }
            return (
              <div key={r.id} className="relative flex items-center">
                <div className="relative flex flex-col items-center z-10 w-28 sm:w-36">
                  <div
                    onClick={() => canClaim && onClaim(r)}
                    className={cn(
                      'w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-4 shadow-xl transition-all relative z-10',
                      canClaim       ? 'bg-amber-400 border-amber-200 text-amber-900 shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-110 cursor-pointer hover:scale-125' :
                      isAlreadyClaimed ? 'bg-zinc-800 border-zinc-600 text-zinc-400 opacity-80' :
                      isNext         ? 'bg-zinc-900 border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] ring-4 ring-emerald-500/20 animate-pulse scale-110' :
                      'bg-zinc-900 border-zinc-800 text-zinc-600'
                    )}>
                    {isAlreadyClaimed
                      ? <Check className="w-5 h-5 text-zinc-500" />
                      : <span className={cn('text-xl sm:text-3xl drop-shadow-sm', !isReached && !isNext && 'opacity-50 grayscale')}>{r.icon}</span>}
                  </div>
                  <div className="absolute top-16 sm:top-20 flex flex-col items-center w-full text-center px-1">
                    <span className={cn('text-[10px] sm:text-xs font-bold leading-tight mb-1',
                      canClaim ? 'text-amber-400' : isAlreadyClaimed ? 'text-zinc-600 line-through' : isNext ? 'text-emerald-400' : 'text-zinc-500'
                    )}>{r.name}</span>
                    {canClaim
                      ? <span className="text-[10px] text-amber-900 font-bold bg-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce mt-0.5 cursor-pointer"
                          onClick={() => onClaim(r)}>Canjear</span>
                      : <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800/80 tracking-widest">{r.coinsRequired} coins</span>}
                  </div>
                </div>
                {i < timelineRewards.length - 1 && (
                  <div className="w-16 sm:w-24 h-3 sm:h-4 bg-zinc-950 rounded-full shadow-inner border border-zinc-900 relative -mx-4 z-0 overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 transition-all duration-1000 ease-out"
                      style={{ width: `${segmentFill > 0 ? Math.max(5, segmentFill) : 0}%` }}>
                      {segmentFill > 0 && <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/40 animate-pulse" />}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
