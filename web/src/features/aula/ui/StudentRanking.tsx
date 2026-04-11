import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StudentResponse, RewardResponse } from '@control-aula/shared'

interface StudentRankingProps {
  students: StudentResponse[]
  individualRewards: RewardResponse[]
  onClaim: (reward: RewardResponse, student: StudentResponse) => void
}

export function StudentRanking({ students, individualRewards, onClaim }: StudentRankingProps) {
  return (
    <div className="lg:col-span-2 card-base p-6">
      <h3 className="panel-title flex items-center gap-2 mb-1">
        <Users className="w-[18px] h-[18px] text-indigo-400" /> Ranking de Estudiantes
      </h3>
      <p className="panel-subtitle mb-4">Coins individuales · Haz clic en un premio dorado para canjearlo.</p>
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {[...students].sort((a, b) => b.coins - a.coins).map((s, i) => {
          const nextInd = individualRewards.find(r => r.coinsRequired > s.coins)
          return (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900/40 border border-transparent hover:border-zinc-800/50 transition-all group">
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                i === 1 ? 'bg-zinc-300/20 text-zinc-300 border border-zinc-300/30' :
                i === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                'text-zinc-600 border border-zinc-800'
              )}>{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100 truncate">{s.name}</p>
                {nextInd && <p className="text-[10px] text-zinc-500 truncate">Próximo: {nextInd.icon} {nextInd.name} ({nextInd.coinsRequired} coins)</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {individualRewards.slice(0, 6).map(r => {
                  const reached = s.coins >= r.coinsRequired
                  const isNextR = nextInd?.id === r.id
                  return (
                    <button key={r.id} title={`${r.name} (${r.coinsRequired} coins)`}
                      onClick={() => reached && onClaim(r, s)}
                      className={cn('w-7 h-7 rounded-full flex items-center justify-center text-sm border transition-all',
                        reached  ? 'bg-amber-400 border-amber-200 text-amber-900 shadow-[0_0_10px_rgba(251,191,36,0.4)] hover:scale-125 cursor-pointer' :
                        isNextR  ? 'bg-zinc-900 border-emerald-500/50 text-zinc-500 animate-pulse' :
                        'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-40 cursor-default grayscale'
                      )}>{r.icon}</button>
                  )
                })}
                <div className="ml-2 text-lg font-black text-white whitespace-nowrap">
                  {s.coins}<span className="text-xs font-medium text-zinc-500 ml-0.5">coins</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
