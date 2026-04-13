'use client'
import { useState, useMemo }     from 'react'
import { ChevronLeft, ChevronRight, ShoppingCart, CheckCircle2 } from 'lucide-react'
import { PortalTabHeader }       from './PortalTabHeader'
import { DiscountCarousel }      from './components/DiscountCarousel'
import { PricePopover }          from './components/PricePopover'
import { ConfirmDialog }         from '@/components/shared/ConfirmDialog'
import { SearchInput, Grid, Button } from '@/components/ui'
import { REQUEST_STATUS }        from '@/config/status'
import type { StudentData, IndividualReward, RewardWithDiscount, Deal } from '../domain/types'

const PAGE_SIZE = 6

const ACCENTS = [
  'border-l-4 border-amber-400/70',
  'border-l-4 border-purple-400/50',
  'border-l-4 border-emerald-400/50',
]

// ─── Seeded discount logic (changes every 2 days) ──────────────────────────────

function seededRng(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297 + 233280) * 233280
  return x - Math.floor(x)
}

function getDeals(rewards: IndividualReward[]): Deal[] {
  const withDiscount = rewards.filter(r => ((r as RewardWithDiscount).discount ?? 0) > 0)
  if (withDiscount.length >= 2) {
    return withDiscount.map(r => {
      const disc = (r as RewardWithDiscount).discount ?? 0
      return { ...r, discount: disc, salePrice: Math.max(1, Math.round(r.coinsRequired * (1 - disc / 100))) }
    })
  }
  if (rewards.length === 0) return []
  const seed    = Math.floor(Date.now() / (1000 * 60 * 60 * 48))
  const count   = Math.min(Math.max(2, Math.floor(rewards.length * 0.4)), 5)
  const pcts    = [10, 15, 20, 25, 30]
  const shuffled = [...rewards].sort((a, b) => seededRng(seed, a.coinsRequired) - seededRng(seed, b.coinsRequired))
  return shuffled.slice(0, count).map((r, i) => {
    const disc = pcts[Math.floor(seededRng(seed + 1, i * 3) * pcts.length)]
    return { ...r, discount: disc, salePrice: Math.max(1, Math.round(r.coinsRequired * (1 - disc / 100))) }
  })
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  student:    StudentData
  rewards:    IndividualReward[]
  requesting: string | null
  onRequest:  (rewardId: string) => void
  onLogout:   () => void
}

export function RecompensasTab({ student, rewards, requesting, onRequest, onLogout }: Props) {
  const [page,          setPage]          = useState(0)
  const [search,        setSearch]        = useState('')
  const [maxCoins,      setMaxCoins]      = useState<number | null>(null)
  const [confirmReward, setConfirmReward] = useState<(IndividualReward & { salePrice: number }) | null>(null)

  const sorted   = useMemo(() => [...rewards].sort((a, b) => a.coinsRequired - b.coinsRequired), [rewards])
  const maxPrice = sorted.length > 0 ? sorted[sorted.length - 1].coinsRequired : 0
  const deals    = useMemo(() => getDeals(sorted), [sorted])

  const available = useMemo(() => {
    const q   = search.trim().toLowerCase()
    const cap = maxCoins ?? maxPrice
    return sorted.filter(r =>
      (q === '' || r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)) &&
      r.coinsRequired <= cap
    )
  }, [sorted, search, maxCoins, maxPrice])

  const handleSearch = (v: string) => { setSearch(v); setPage(0) }
  const handleSlider = (v: number) => { setMaxCoins(v); setPage(0) }
  const clearSlider  = () => { setMaxCoins(null); setPage(0) }

  const totalPages = Math.ceil(available.length / PAGE_SIZE)
  const paged      = available.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

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

        {/* Balance hero */}
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
            deals={deals}
            coins={student.coins}
            requesting={requesting}
            onAskConfirm={(reward, salePrice) => setConfirmReward({ ...reward, salePrice })}
            redemptionRequests={student.redemptionRequests}
          />
        )}

        <div className="flex items-center gap-2 mb-6">
          <SearchInput value={search} onChange={handleSearch} placeholder="Search reward…" className="flex-1" />
          {maxPrice > 0 && (
            <PricePopover maxPrice={maxPrice} value={maxCoins} onChange={handleSlider} onClear={clearSlider} />
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
                const globalIdx      = page * PAGE_SIZE + idx
                const isFeatured     = idx === 0 || idx === 3
                const canAfford      = student.coins >= r.coinsRequired
                const alreadyPending = student.redemptionRequests.some(
                  req => req.rewardId === r.id && req.status === REQUEST_STATUS.PENDING
                )
                const accent = ACCENTS[globalIdx % ACCENTS.length]

                return (
                  <div
                    key={r.id}
                    className={`group rounded-xl p-4 transition-all duration-300 ${accent} ${
                      isFeatured ? 'col-span-2 flex gap-4' : 'flex flex-col'
                    } ${canAfford ? 'bg-zinc-900/80 hover:bg-zinc-800/90' : 'bg-zinc-900/40 opacity-60'}`}
                  >
                    <div className={`bg-zinc-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isFeatured ? 'w-14 h-14 self-center' : 'w-11 h-11 mb-3'}`}>
                      {r.icon}
                    </div>
                    <div className={`${isFeatured ? 'flex-1 min-w-0' : ''}`}>
                      {isFeatured && (
                        <span className="text-amber-400 font-bold text-sm float-right">{r.coinsRequired}c</span>
                      )}
                      <h3 className={`text-zinc-100 font-bold leading-tight ${isFeatured ? 'text-base mb-1' : 'text-sm mb-1'}`}>{r.name}</h3>
                      {r.description && (
                        <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed mb-3">{r.description}</p>
                      )}
                      {!isFeatured && (
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-amber-400 font-bold text-xs">{r.coinsRequired} c</span>
                        </div>
                      )}
                      {alreadyPending ? (
                        <Button
                          disabled variant="secondary"
                          className={`${isFeatured ? 'mt-2' : ''} w-full py-2 h-auto rounded-xl cursor-default`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sent
                        </Button>
                      ) : (
                        <Button
                          variant={canAfford ? 'amber' : 'secondary'}
                          disabled={!canAfford || !!requesting}
                          loading={requesting === r.id}
                          onClick={() => canAfford && !requesting && setConfirmReward({ ...r, salePrice: r.coinsRequired })}
                          className={`${isFeatured ? 'mt-2' : ''} w-full py-2 h-auto rounded-xl active:scale-95 ${!canAfford ? 'cursor-not-allowed' : ''}`}
                        >
                          {canAfford ? 'Request' : 'Not enough coins'}
                        </Button>
                      )}
                    </div>
                  </div>
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
      </main>
    </div>
  )
}
