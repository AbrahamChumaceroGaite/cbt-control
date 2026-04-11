import { Users }                    from 'lucide-react'
import { RankBadge }                from '@/components/shared/RankBadge'
import { RewardMilestoneButton }    from '@/components/shared/RewardMilestoneButton'
import type { StudentResponse, RewardResponse } from '@control-aula/shared'

interface StudentRankingProps {
  students:         StudentResponse[]
  individualRewards: RewardResponse[]
  onClaim:          (reward: RewardResponse, student: StudentResponse) => void
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
              <RankBadge position={i + 1} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100 truncate">{s.name}</p>
                {nextInd && <p className="text-[10px] text-zinc-500 truncate">Próximo: {nextInd.icon} {nextInd.name} ({nextInd.coinsRequired} coins)</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {individualRewards.slice(0, 6).map(r => {
                  const reached = s.coins >= r.coinsRequired
                  const isNext  = nextInd?.id === r.id
                  return (
                    <RewardMilestoneButton
                      key={r.id}
                      state={reached ? 'reached' : isNext ? 'next' : 'locked'}
                      icon={r.icon}
                      title={`${r.name} (${r.coinsRequired} coins)`}
                      onClick={() => onClaim(r, s)}
                    />
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
