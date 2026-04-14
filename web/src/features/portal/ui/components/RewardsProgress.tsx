'use client'
import { useCallback, useEffect, useState } from 'react'
import { Zap, Clock } from 'lucide-react'
import { useInterval }  from '@/hooks/useInterval'
import { PROGRESS_BAR } from '@/config/scheme'
import type { IndividualReward } from '../../domain/types'

function useResetCountdown(): string {
  const [countdown, setCountdown] = useState('')

  const calc = useCallback(() => {
    const now       = new Date()
    const day       = now.getDay()
    const daysUntil = day === 1 ? 7 : (1 - day + 7) % 7 || 7
    const next      = new Date(now)
    next.setDate(now.getDate() + daysUntil)
    next.setHours(0, 0, 0, 0)
    const diff = next.getTime() - now.getTime()
    const d    = Math.floor(diff / 86_400_000)
    const h    = Math.floor((diff % 86_400_000) / 3_600_000)
    const m    = Math.floor((diff % 3_600_000)  / 60_000)
    const s    = Math.floor((diff % 60_000) / 1_000)
    setCountdown(`${String(d).padStart(2,'0')}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`)
  }, [])

  useEffect(() => { calc() }, [calc])
  useInterval(calc, 1000)

  return countdown
}

interface Props {
  coins:      number
  rewards:    IndividualReward[]
  pendingIds: Set<string>
}

export function RewardsProgress({ coins, rewards, pendingIds }: Props) {
  const countdown = useResetCountdown()

  const sorted = [...rewards]
    .filter(r => !pendingIds.has(r.id) && coins < r.coinsRequired)
    .sort((a, b) => a.coinsRequired - b.coinsRequired)

  if (!sorted.length) return (
    <p className="text-xs text-zinc-500 text-center py-4">
      {rewards.length > 0 ? 'You can already redeem all available rewards!' : 'No rewards configured'}
    </p>
  )

  return (
    <div>
      <div className="space-y-4">
        {sorted.map((r, i) => {
          const isNext = i === 0
          const pct    = Math.min(99, Math.round((coins / r.coinsRequired) * 100))
          const bar    = PROGRESS_BAR[isNext ? 'next' : 'default']
          return (
            <div key={r.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold flex items-center gap-2 ${isNext ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <span className="text-base leading-none">{r.icon}</span>
                  {r.name}
                  {isNext && <Zap className="w-3 h-3 text-emerald-400" />}
                </span>
                <span className="font-semibold text-zinc-500">{pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: bar.gradient, boxShadow: bar.shadow }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>{coins} / {r.coinsRequired} coins</span>
                <span>{r.coinsRequired - coins} to go</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-zinc-800/50">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500 mb-2 flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> Resets in
        </p>
        <span className="font-mono text-2xl font-black text-amber-400 tracking-widest tabular-nums">{countdown}</span>
      </div>
    </div>
  )
}
