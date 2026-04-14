'use client'
import { useState, useCallback } from 'react'
import { CheckCircle2, Zap }     from 'lucide-react'
import { Button }                from '@/components/ui'
import { useInterval }           from '@/hooks/useInterval'
import { REQUEST_STATUS }        from '@/config/status'
import { DEAL_THEMES }           from '@/config/scheme'
import type { StudentData, Deal } from '../../domain/types'

interface Props {
  deals:              Deal[]
  coins:              number
  requesting:         string | null
  onAskConfirm:       (reward: Deal, salePrice: number) => void
  redemptionRequests: StudentData['redemptionRequests']
}

export function DiscountCarousel({ deals, coins, requesting, onAskConfirm, redemptionRequests }: Props) {
  const [idx, setIdx] = useState(0)
  const advance = useCallback(() => setIdx(i => (i + 1) % deals.length), [deals.length])
  // Delay=null pauses the carousel when only 1 deal
  useInterval(advance, deals.length > 1 ? 4000 : null)

  if (deals.length === 0) return null

  const deal      = deals[idx]
  const theme     = DEAL_THEMES[idx % DEAL_THEMES.length]
  const canAfford = coins >= deal.salePrice
  const pending   = redemptionRequests.some(r => r.rewardId === deal.id && r.status === REQUEST_STATUS.PENDING)
  const savings   = deal.coinsRequired - deal.salePrice

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/20">
          <Zap className="w-3 h-3 text-rose-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-rose-400">Flash Deals</span>
        </div>
        <span className="text-[10px] text-zinc-600">Auto-rotate every 2 days</span>
        <div className="flex-1 h-px bg-zinc-800" />
        <div className="flex items-center gap-1">
          {deals.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-1.5 bg-rose-400' : 'w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500'}`}
            />
          ))}
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} min-h-[200px] cursor-pointer group`} style={{ transition: 'all 0.5s' }}>
        <div className={`absolute -top-10 -right-10 w-52 h-52 ${theme.glow} blur-[80px] rounded-full pointer-events-none`} />
        <div className="absolute -bottom-8 -right-6 text-[140px] leading-none select-none pointer-events-none opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-700 rotate-12">
          {deal.icon}
        </div>
        <div className="absolute top-6 left-6 w-1.5 h-1.5 rounded-full animate-ping opacity-40" style={{ background: theme.accent }} />
        <div className="absolute top-12 left-16 w-1 h-1 rounded-full animate-ping opacity-30 [animation-delay:0.5s]" style={{ background: theme.accent }} />
        <div className="absolute top-4 right-32 w-1 h-1 rounded-full animate-ping opacity-25 [animation-delay:1s]" style={{ background: theme.accent }} />
        <div className="absolute top-0 right-0 px-3 py-1.5 text-black text-xs font-black rounded-bl-xl shadow-lg" style={{ background: theme.accent }}>
          -{deal.discount}% OFF
        </div>

        <div className="relative z-10 p-6 flex flex-col justify-between min-h-[200px]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] px-2 py-1 rounded-lg border"
              style={{ color: theme.accent, borderColor: `${theme.accent}30`, background: `${theme.accent}10` }}>
              Individual Reward
            </span>
          </div>

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

          <div className="flex items-end justify-between mt-4 gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white leading-none">{deal.salePrice}</span>
                <span className="text-sm font-bold text-white/60">coins</span>
                <span className="text-sm text-white/40 line-through">{deal.coinsRequired}</span>
              </div>
              <p className="text-[11px] mt-1" style={{ color: theme.accent }}>
                Save {savings} coin{savings !== 1 ? 's' : ''}
              </p>
            </div>
            {pending ? (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800/80 text-zinc-400 text-xs font-bold flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sent
              </div>
            ) : (
              <Button
                onClick={() => canAfford && !requesting && onAskConfirm(deal, deal.salePrice)}
                disabled={!canAfford || !!requesting}
                loading={requesting === deal.id}
                className="px-6 py-2.5 h-auto rounded-xl text-sm font-black active:scale-95 flex-shrink-0 shadow-lg"
                style={canAfford
                  ? { background: theme.accent, color: '#000', boxShadow: `0 0 20px ${theme.accent}40` }
                  : { background: 'rgba(39,39,42,0.8)', color: '#71717a' }}
              >
                {canAfford ? 'Request now' : 'Not enough coins'}
              </Button>
            )}
          </div>

          <div className="mt-3">
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((coins / deal.salePrice) * 100))}%`,
                  background: canAfford ? theme.accent : 'rgba(255,255,255,0.2)',
                }} />
            </div>
            {!canAfford && (
              <p className="text-[10px] text-white/40 mt-1">You need {deal.salePrice - coins} more coins</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
