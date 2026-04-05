'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, ShoppingCart, CheckCircle2, SlidersHorizontal, Zap, X } from 'lucide-react'
import { PortalTabHeader } from '@/features/portal/PortalTabHeader'
import { ConfirmDialog }   from '@/components/shared/ConfirmDialog'
import { SearchInput }     from '@/components/ui'
import type { StudentData, IndividualReward } from '@/services/portal.service'

const PAGE_SIZE = 6

const ACCENTS = [
  'border-l-4 border-amber-400/70',
  'border-l-4 border-purple-400/50',
  'border-l-4 border-emerald-400/50',
]

// Gradients for the ad-card carousel
const DEAL_GRADIENTS = [
  { bg: 'from-rose-950 via-zinc-950 to-zinc-950',   accent: '#f43f5e', glow: 'bg-rose-500/20'   },
  { bg: 'from-violet-950 via-zinc-950 to-zinc-950',  accent: '#8b5cf6', glow: 'bg-violet-500/20' },
  { bg: 'from-amber-950 via-zinc-950 to-zinc-950',   accent: '#f59e0b', glow: 'bg-amber-500/20'  },
  { bg: 'from-sky-950 via-zinc-950 to-zinc-950',     accent: '#0ea5e9', glow: 'bg-sky-500/20'    },
  { bg: 'from-emerald-950 via-zinc-950 to-zinc-950', accent: '#10b981', glow: 'bg-emerald-500/20' },
]

// ─── Seeded discount logic (changes every 2 days) ─────────────────────────────

type Deal = IndividualReward & { discount: number; salePrice: number }

function seededRng(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297 + 233280) * 233280
  return x - Math.floor(x)
}

function getDeals(rewards: IndividualReward[]): Deal[] {
  // Prefer rewards that have a DB-set discount > 0
  const withDiscount = rewards.filter(r => (r as any).discount > 0)
  if (withDiscount.length >= 2) {
    return withDiscount.map(r => ({
      ...r,
      discount:  (r as any).discount as number,
      salePrice: Math.max(1, Math.round(r.coinsRequired * (1 - (r as any).discount / 100))),
    }))
  }

  // Fallback: seeded frontend selection
  if (rewards.length === 0) return []
  const seed  = Math.floor(Date.now() / (1000 * 60 * 60 * 48))
  const count = Math.min(Math.max(2, Math.floor(rewards.length * 0.4)), 5)
  const pcts  = [10, 15, 20, 25, 30]
  const shuffled = [...rewards].sort((a, b) => seededRng(seed, a.coinsRequired) - seededRng(seed, b.coinsRequired))
  return shuffled.slice(0, count).map((r, i) => {
    const disc = pcts[Math.floor(seededRng(seed + 1, i * 3) * pcts.length)]
    return { ...r, discount: disc, salePrice: Math.max(1, Math.round(r.coinsRequired * (1 - disc / 100))) }
  })
}

// ─── Discount Carousel (AdCard style) ────────────────────────────────────────

function DiscountCarousel({ deals, coins, requesting, onAskConfirm, redemptionRequests }: {
  deals: Deal[]
  coins: number
  requesting: string | null
  onAskConfirm: (reward: Deal, salePrice: number) => void
  redemptionRequests: StudentData['redemptionRequests']
}) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (deals.length <= 1) return
    const id = setInterval(() => setIdx(i => (i + 1) % deals.length), 4000)
    return () => clearInterval(id)
  }, [deals.length])

  if (deals.length === 0) return null

  const deal    = deals[idx]
  const theme   = DEAL_GRADIENTS[idx % DEAL_GRADIENTS.length]
  const canAfford = coins >= deal.salePrice
  const pending   = redemptionRequests.some(r => r.rewardId === deal.id && r.status === 'pending')
  const savings   = deal.coinsRequired - deal.salePrice

  return (
    <section className="mb-6">
      {/* Label row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/20">
          <Zap className="w-3 h-3 text-rose-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-rose-400">Flash Deals</span>
        </div>
        <span className="text-[10px] text-zinc-600">Cambian automáticamente cada 2 días</span>
        <div className="flex-1 h-px bg-zinc-800" />
        <div className="flex items-center gap-1">
          {deals.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-1.5 bg-rose-400' : 'w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500'}`}
            />
          ))}
        </div>
      </div>

      {/* Full ad card */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} min-h-[200px] cursor-pointer group`}
        style={{ transition: 'all 0.5s' }}
      >
        {/* Glow orb */}
        <div className={`absolute -top-10 -right-10 w-52 h-52 ${theme.glow} blur-[80px] rounded-full pointer-events-none`} />

        {/* Floating background icon (big, semi-transparent) */}
        <div className="absolute -bottom-8 -right-6 text-[140px] leading-none select-none pointer-events-none opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-700 rotate-12">
          {deal.icon}
        </div>

        {/* Animated sparkles */}
        <div className="absolute top-6 left-6 w-1.5 h-1.5 rounded-full animate-ping opacity-40" style={{ background: theme.accent }} />
        <div className="absolute top-12 left-16 w-1 h-1 rounded-full animate-ping opacity-30 [animation-delay:0.5s]" style={{ background: theme.accent }} />
        <div className="absolute top-4 right-32 w-1 h-1 rounded-full animate-ping opacity-25 [animation-delay:1s]" style={{ background: theme.accent }} />

        {/* Discount ribbon */}
        <div
          className="absolute top-0 right-0 px-3 py-1.5 text-black text-xs font-black rounded-bl-xl shadow-lg"
          style={{ background: theme.accent }}
        >
          -{deal.discount}% OFF
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col justify-between min-h-[200px]">
          {/* Top: category chip */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] px-2 py-1 rounded-lg border"
              style={{ color: theme.accent, borderColor: `${theme.accent}30`, background: `${theme.accent}10` }}>
              Premio Individual
            </span>
          </div>

          {/* Middle: title */}
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl leading-none">{deal.icon}</span>
              <div>
                <h3 className="text-xl font-black text-white leading-tight">{deal.name}</h3>
                {deal.description && (
                  <p className="text-sm text-white/60 line-clamp-1 mt-0.5">{deal.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom: price + CTA */}
          <div className="flex items-end justify-between mt-4 gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white leading-none">{deal.salePrice}</span>
                <span className="text-sm font-bold text-white/60">coins</span>
                <span className="text-sm text-white/40 line-through">{deal.coinsRequired}</span>
              </div>
              <p className="text-[11px] mt-1" style={{ color: theme.accent }}>
                Ahorras {savings} coin{savings !== 1 ? 's' : ''}
              </p>
            </div>
            {pending ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800/80 text-zinc-400 text-xs font-bold flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Enviado
              </div>
            ) : (
              <button
                onClick={() => canAfford && !requesting && onAskConfirm(deal, deal.salePrice)}
                disabled={!canAfford || !!requesting}
                className="px-6 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 flex-shrink-0 shadow-lg"
                style={canAfford ? {
                  background: theme.accent,
                  color: '#000',
                  boxShadow: `0 0 20px ${theme.accent}40`,
                } : {
                  background: 'rgba(39,39,42,0.8)',
                  color: '#71717a',
                }}
              >
                {requesting === deal.id ? '…' : canAfford ? 'Pedir ahora' : 'Sin coins'}
              </button>
            )}
          </div>

          {/* Coin progress */}
          <div className="mt-3">
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((coins / deal.salePrice) * 100))}%`,
                  background: canAfford ? theme.accent : 'rgba(255,255,255,0.2)',
                }} />
            </div>
            {!canAfford && (
              <p className="text-[10px] text-white/40 mt-1">Te faltan {deal.salePrice - coins} coins</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Price filter popover ─────────────────────────────────────────────────────

function PricePopover({ maxPrice, value, onChange, onClear }: {
  maxPrice: number
  value: number | null
  onChange: (v: number) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = value !== null && value < maxPrice

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-semibold transition-colors flex-shrink-0 ${
          active
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
            : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        {active ? `≤${value}c` : 'Precio'}
        {active && (
          <X className="w-3 h-3 ml-0.5" onClick={e => { e.stopPropagation(); onClear(); setOpen(false) }} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-2xl shadow-black/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-500">Precio máximo</span>
            <span className="font-mono text-xs font-bold text-amber-400">{value ?? maxPrice}</span>
          </div>
          <input
            type="range"
            min={0}
            max={maxPrice}
            step={1}
            value={value ?? maxPrice}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-zinc-700
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:mt-[-5px]
              [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(251,191,36,0.5)]"
          />
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>0</span><span>{maxPrice} coins</span>
          </div>
          {active && (
            <button onClick={() => { onClear(); setOpen(false) }}
              className="w-full h-7 rounded-lg text-xs text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors border border-zinc-800">
              Limpiar filtro
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  student: StudentData
  rewards: IndividualReward[]
  requesting: string | null
  onRequest: (rewardId: string) => void
  onLogout: () => void
}

export function RecompensasTab({ student, rewards, requesting, onRequest, onLogout }: Props) {
  const [page, setPage]           = useState(0)
  const [search, setSearch]       = useState('')
  const [maxCoins, setMaxCoins]   = useState<number | null>(null)
  const [confirmReward, setConfirmReward] = useState<(IndividualReward & { salePrice: number }) | null>(null)

  function askConfirm(reward: IndividualReward, salePrice: number) {
    setConfirmReward({ ...reward, salePrice })
  }

  function doRequest() {
    if (!confirmReward) return
    onRequest(confirmReward.id)
    setConfirmReward(null)
  }

  const sorted = useMemo(
    () => [...rewards].sort((a, b) => a.coinsRequired - b.coinsRequired),
    [rewards]
  )

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

  return (
    <div className="min-h-screen pb-28">
      <PortalTabHeader student={student} onLogout={onLogout} />

      <ConfirmDialog
        open={!!confirmReward}
        onConfirm={doRequest}
        onCancel={() => setConfirmReward(null)}
        title={`Pedir: ${confirmReward?.name ?? ''}`}
        message={`Costo: ${confirmReward?.salePrice ?? 0} coins${(confirmReward?.coinsRequired ?? 0) > (confirmReward?.salePrice ?? 0) ? ` (descuento aplicado, precio original ${confirmReward?.coinsRequired})` : ''}. La solicitud será revisada por el administrador.`}
        confirmText="Confirmar solicitud"
        loading={requesting === confirmReward?.id}
        icon={confirmReward ? <span className="text-4xl">{(confirmReward as any).icon}</span> : undefined}
      />

      <main className="max-w-2xl mx-auto px-4 pt-6">

        {/* Balance hero */}
        <section className="relative overflow-hidden rounded-2xl bg-zinc-900/80 p-5 flex items-center justify-between gap-4 mb-6">
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-0.5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">Balance Actual</p>
            <h1 className="text-2xl font-extrabold text-amber-400 tracking-tight leading-none">{student.coins} coins</h1>
          </div>
          <div className="relative z-10 w-14 h-14 bg-amber-500/15 rounded-2xl flex items-center justify-center border border-amber-500/10 flex-shrink-0">
            <ShoppingCart className="w-6 h-6 text-amber-400" />
          </div>
        </section>

        {/* Discount carousel */}
        {deals.length > 0 && (
          <DiscountCarousel
            deals={deals}
            coins={student.coins}
            requesting={requesting}
            onAskConfirm={askConfirm}
            redemptionRequests={student.redemptionRequests}
          />
        )}

        {/* Filters row */}
        <div className="flex items-center gap-2 mb-6">
          <SearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Buscar premio…"
            className="flex-1"
          />
          {maxPrice > 0 && (
            <PricePopover
              maxPrice={maxPrice}
              value={maxCoins}
              onChange={handleSlider}
              onClear={clearSlider}
            />
          )}
        </div>

        {/* Section title */}
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">Premios Disponibles</h2>
          <div className="flex-1 h-px bg-zinc-800" />
          {available.length > 0 && <span className="text-[10px] text-zinc-600">{available.length} premios</span>}
        </div>

        {/* Collage grid */}
        {available.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-600">No hay recompensas disponibles</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {paged.map((r, idx) => {
                const globalIdx  = page * PAGE_SIZE + idx
                const isFeatured = idx === 0 || idx === 3  // 0th and 3rd are full-width on sm+
                const canAfford      = student.coins >= r.coinsRequired
                const alreadyPending = student.redemptionRequests.some(
                  req => req.rewardId === r.id && req.status === 'pending'
                )
                const accent = ACCENTS[globalIdx % ACCENTS.length]

                return (
                  <div
                    key={r.id}
                    className={`group rounded-xl p-4 transition-all duration-300 ${accent} ${
                      isFeatured ? 'col-span-2 flex gap-4' : 'flex flex-col'
                    } ${canAfford ? 'bg-zinc-900/80 hover:bg-zinc-800/90' : 'bg-zinc-900/40 opacity-60'}`}
                  >
                    {/* Icon */}
                    <div className={`bg-zinc-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${isFeatured ? 'w-14 h-14 self-center' : 'w-11 h-11 mb-3'}`}>
                      {r.icon}
                    </div>

                    {/* Info */}
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
                        <button disabled className={`${isFeatured ? 'mt-2' : ''} w-full py-2 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-bold flex items-center justify-center gap-2 cursor-default`}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Enviado
                        </button>
                      ) : (
                        <button
                          onClick={() => canAfford && !requesting && askConfirm(r, r.coinsRequired)}
                          disabled={!canAfford || !!requesting}
                          className={`${isFeatured ? 'mt-2' : ''} w-full py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                            canAfford ? 'bg-amber-400 text-zinc-900 hover:bg-amber-300' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                          }`}
                        >
                          {requesting === r.id ? 'Enviando…' : canAfford ? 'Pedir' : 'Sin coins'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between py-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="text-xs text-zinc-500">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
