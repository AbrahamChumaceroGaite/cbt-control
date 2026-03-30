import type { StudentData, IndividualReward } from '@/services/portal.service'

interface RecompensasTabProps {
  student: StudentData
  rewards: IndividualReward[]
  requesting: string | null
  onRequest: (rewardId: string) => void
}

export function RecompensasTab({ student, rewards, requesting, onRequest }: RecompensasTabProps) {
  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <div className="text-xs text-zinc-600 pb-1">
        Tienes <span className="text-amber-400 font-bold">{student.coins} coins</span> disponibles
      </div>
      {rewards.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">No hay recompensas disponibles</div>
      ) : (
        rewards.map(r => {
          const canAfford     = student.coins >= r.coinsRequired
          const alreadyRedeemed = student.individualRedemptions.some(ir => ir.rewardId === r.id)
          const alreadyPending  = student.redemptionRequests.some(
            req => req.reward.name === r.name && req.status === 'pending'
          )
          if (alreadyRedeemed) return null
          return (
            <div key={r.id} className={`flex items-center gap-4 bg-zinc-900 border rounded-2xl p-4 transition-all ${canAfford ? 'border-zinc-700/60' : 'border-zinc-800/40 opacity-60'}`}>
              <div className="text-3xl shrink-0">{r.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-zinc-200 text-sm leading-tight">{r.name}</div>
                {r.description && <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{r.description}</div>}
                <div className={`text-xs font-bold mt-1.5 ${canAfford ? 'text-amber-400' : 'text-zinc-600'}`}>
                  {r.coinsRequired} coins
                </div>
              </div>
              <button
                onClick={() => !alreadyPending && canAfford && onRequest(r.id)}
                disabled={!canAfford || alreadyPending || requesting === r.id}
                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  alreadyPending
                    ? 'bg-zinc-800 text-zinc-500 cursor-default'
                    : canAfford
                      ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {requesting === r.id ? '...' : alreadyPending ? 'Enviado' : 'Pedir'}
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}
