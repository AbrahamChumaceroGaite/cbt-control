'use client'
import { useState, useMemo }  from 'react'
import { ShoppingCart }       from 'lucide-react'
import { PortalTabHeader }    from './PortalTabHeader'
import { DiscountCarousel }   from './components/DiscountCarousel'
import { RewardList }         from './components/RewardList'
import { ConfirmDialog }      from '@/components/shared/ConfirmDialog'
import { getDeals }           from '../application/getDeals'
import type { StudentData, IndividualReward, RewardWithDiscount } from '../domain/types'

interface Props {
  student:    StudentData
  rewards:    IndividualReward[]
  requesting: string | null
  onRequest:  (rewardId: string) => void
  onLogout:   () => void
}

export function RecompensasTab({ student, rewards, requesting, onRequest, onLogout }: Props) {
  const [confirmReward, setConfirmReward] = useState<(IndividualReward & { salePrice: number }) | null>(null)

  const sorted = useMemo(() => [...rewards].sort((a, b) => a.coinsRequired - b.coinsRequired), [rewards])
  const deals  = useMemo(() => getDeals(sorted), [sorted])

  function doRequest() {
    if (!confirmReward) return
    onRequest(confirmReward.id)
    setConfirmReward(null)
  }

  return (
    <div className="min-h-screen pb-28">
      <PortalTabHeader student={student} onLogout={onLogout} />

      <ConfirmDialog
        open={!!confirmReward}
        onConfirm={doRequest}
        onCancel={() => setConfirmReward(null)}
        title={`Request: ${confirmReward?.name ?? ''}`}
        message={`Cost: ${confirmReward?.salePrice ?? 0} coins${(confirmReward?.coinsRequired ?? 0) > (confirmReward?.salePrice ?? 0) ? ` (discount applied, original price ${confirmReward?.coinsRequired})` : ''}. The request will be reviewed by an admin.`}
        confirmText="Confirm request"
        loading={requesting === confirmReward?.id}
        icon={confirmReward ? <span className="text-4xl">{(confirmReward as RewardWithDiscount).icon}</span> : undefined}
      />

      <main className="max-w-2xl mx-auto px-4 pt-6">
        <section className="relative overflow-hidden rounded-2xl bg-zinc-900/80 p-5 flex items-center justify-between gap-4 mb-6">
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-0.5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">Current Balance</p>
            <h1 className="text-2xl font-extrabold text-amber-400 tracking-tight leading-none">{student.coins} coins</h1>
          </div>
          <div className="relative z-10 w-14 h-14 bg-amber-500/15 rounded-2xl flex items-center justify-center border border-amber-500/10 flex-shrink-0">
            <ShoppingCart className="w-6 h-6 text-amber-400" />
          </div>
        </section>

        {deals.length > 0 && (
          <DiscountCarousel
            deals={deals} coins={student.coins} requesting={requesting}
            onAskConfirm={(reward, salePrice) => setConfirmReward({ ...reward, salePrice })}
            redemptionRequests={student.redemptionRequests}
          />
        )}

        <RewardList
          rewards={sorted} student={student} requesting={requesting}
          onAskConfirm={(reward, salePrice) => setConfirmReward({ ...reward, salePrice })}
        />
      </main>
    </div>
  )
}
