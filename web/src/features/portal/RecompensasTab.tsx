'use client'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ShoppingCart, CheckCircle2, Search, SlidersHorizontal } from 'lucide-react'
import { PortalTabHeader } from '@/features/portal/PortalTabHeader'
import type { StudentData, IndividualReward } from '@/services/portal.service'

const PAGE_SIZE = 6

// Cycle through left-border accent colors
const ACCENTS = [
  'border-l-4 border-amber-400/70',
  'border-l-4 border-purple-400/50',
  'border-l-4 border-emerald-400/50',
]

interface Props {
  student: StudentData
  rewards: IndividualReward[]
  requesting: string | null
  onRequest: (rewardId: string) => void
  onLogout: () => void
}

export function RecompensasTab({ student, rewards, requesting, onRequest, onLogout }: Props) {
  const [page, setPage]         = useState(0)
  const [search, setSearch]     = useState('')
  const [maxCoins, setMaxCoins] = useState<number | null>(null)

  // API already returns only active individual rewards — sort by price
  const sorted = useMemo(
    () => [...rewards].sort((a, b) => a.coinsRequired - b.coinsRequired),
    [rewards]
  )

  const maxPrice = sorted.length > 0 ? sorted[sorted.length - 1].coinsRequired : 0

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

  const totalPages = Math.ceil(available.length / PAGE_SIZE)
  const paged      = available.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="min-h-screen pb-28">
      <PortalTabHeader student={student} onLogout={onLogout} />

      <main className="max-w-2xl mx-auto px-4 pt-6">

        {/* Balance hero */}
        <section className="relative overflow-hidden rounded-2xl bg-zinc-900/80 p-6 flex items-center justify-between gap-4 mb-8">
          <div className="absolute -right-10 -top-10 w-44 h-44 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">Balance Actual</p>
            <h1 className="text-3xl font-extrabold text-amber-400 tracking-tight leading-none">
              Tienes {student.coins} coins
            </h1>
            <p className="text-xs text-zinc-500">Sigue completando desafíos para obtener más recompensas.</p>
          </div>
          <div className="relative z-10 w-16 h-16 bg-amber-500/15 rounded-2xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(251,191,36,0.15)] border border-amber-500/10 flex-shrink-0">
            <ShoppingCart className="w-7 h-7 text-amber-400" />
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Buscar premio…"
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Price slider */}
          {maxPrice > 0 && (
            <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-500">
                  <SlidersHorizontal className="w-3 h-3" />
                  Precio máximo
                </div>
                <span className="font-mono text-xs font-bold text-amber-400">
                  {maxCoins ?? maxPrice} coins
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={maxPrice}
                step={1}
                value={maxCoins ?? maxPrice}
                onChange={e => handleSlider(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-runnable-track]:rounded-full
                  [&::-webkit-slider-runnable-track]:bg-zinc-700
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-amber-400
                  [&::-webkit-slider-thumb]:mt-[-5px]
                  [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(251,191,36,0.5)]
                  [&::-moz-range-track]:rounded-full
                  [&::-moz-range-track]:bg-zinc-700
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-amber-400
                  [&::-moz-range-thumb]:border-0"
              />
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>0</span>
                <span>{maxPrice}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section title */}
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">
            Premios Disponibles
          </h2>
          <div className="flex-1 h-px bg-zinc-800" />
          {available.length > 0 && (
            <span className="text-[10px] text-zinc-600">{available.length} premios</span>
          )}
        </div>

        {/* Grid */}
        {available.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-600">No hay recompensas disponibles</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {paged.map((r, idx) => {
                const canAfford     = student.coins >= r.coinsRequired
                const alreadyPending = student.redemptionRequests.some(
                  req => req.reward?.name === r.name && req.status === 'pending'
                )
                const accent = ACCENTS[(page * PAGE_SIZE + idx) % ACCENTS.length]
                return (
                  <div
                    key={r.id}
                    className={`group rounded-xl p-5 transition-all duration-300 ${accent} ${
                      canAfford
                        ? 'bg-zinc-900/80 hover:bg-zinc-800/90'
                        : 'bg-zinc-900/40 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        {r.icon}
                      </div>
                      <span className="text-amber-400 font-bold text-sm">{r.coinsRequired} Coins</span>
                    </div>
                    <h3 className="text-zinc-100 font-bold text-base mb-1 leading-tight">{r.name}</h3>
                    {r.description && (
                      <p className="text-zinc-500 text-xs mb-4 line-clamp-2 leading-relaxed">{r.description}</p>
                    )}
                    {alreadyPending ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-bold flex items-center justify-center gap-2 cursor-default"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Enviado
                      </button>
                    ) : (
                      <button
                        onClick={() => canAfford && !requesting && onRequest(r.id)}
                        disabled={!canAfford || !!requesting}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                          canAfford
                            ? 'bg-amber-400 text-zinc-900 hover:bg-amber-300'
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        {requesting === r.id ? 'Enviando…' : canAfford ? 'Pedir' : 'Sin coins'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="text-xs text-zinc-500">{page + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
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
