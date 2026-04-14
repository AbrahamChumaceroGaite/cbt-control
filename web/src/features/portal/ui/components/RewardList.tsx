import { useState } from 'react'
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import { SearchInput, Grid }     from '@/components/ui'
import { PricePopover }          from './PricePopover'
import { PortalRewardCard }      from './PortalRewardCard'
import { REQUEST_STATUS }        from '@/config/status'
import type { IndividualReward, StudentData } from '../../domain/types'

const PAGE_SIZE = 6

interface Props {
  rewards:    IndividualReward[]
  student:    Pick<StudentData, 'coins' | 'redemptionRequests'>
  requesting: string | null
  onAskConfirm: (reward: IndividualReward, salePrice: number) => void
}

export function RewardList({ rewards, student, requesting, onAskConfirm }: Props) {
  const [page,     setPage]     = useState(0)
  const [search,   setSearch]   = useState('')
  const [maxCoins, setMaxCoins] = useState<number | null>(null)

  const maxPrice  = rewards.length > 0 ? rewards[rewards.length - 1].coinsRequired : 0
  const cap       = maxCoins ?? maxPrice
  const q         = search.trim().toLowerCase()
  const available = rewards.filter(r =>
    (q === '' || r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)) &&
    r.coinsRequired <= cap
  )

  const totalPages = Math.ceil(available.length / PAGE_SIZE)
  const paged      = available.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(0) }} placeholder="Search reward…" className="flex-1" />
        {maxPrice > 0 && (
          <PricePopover maxPrice={maxPrice} value={maxCoins} onChange={v => { setMaxCoins(v); setPage(0) }} onClear={() => { setMaxCoins(null); setPage(0) }} />
        )}
      </div>

      <div className="flex items-center gap-4 mb-5">
        <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">Available Rewards</h2>
        <div className="flex-1 h-px bg-zinc-800" />
        {available.length > 0 && <span className="text-[10px] text-zinc-600">{available.length} rewards</span>}
      </div>

      {available.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-600">No rewards available</p>
        </div>
      ) : (
        <>
          <Grid cols={2} gap="sm" className="mb-6">
            {paged.map((r, idx) => {
              const globalIdx    = page * PAGE_SIZE + idx
              const canAfford    = student.coins >= r.coinsRequired
              const alreadyPending = student.redemptionRequests.some(
                req => req.rewardId === r.id && req.status === REQUEST_STATUS.PENDING
              )
              return (
                <PortalRewardCard
                  key={r.id} reward={r}
                  globalIndex={globalIdx} isFeatured={idx === 0 || idx === 3}
                  canAfford={canAfford} alreadyPending={alreadyPending}
                  requesting={requesting} onAskConfirm={onAskConfirm}
                />
              )
            })}
          </Grid>

          {totalPages > 1 && (
            <div className="flex items-center justify-between py-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs text-zinc-500">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
