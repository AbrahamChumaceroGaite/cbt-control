import { Coins, BookOpen, TrendingUp, TrendingDown } from 'lucide-react'
import { Sparkline }    from './Sparkline'
import { HERO_BANNER, TREND_HEX } from '@/config/scheme'

interface Props {
  coins:       number
  courseCoins: number
  courseName:  string
  sparkline:   number[]
  trending:    boolean
}

export function CoinStatsCards({ coins, courseCoins, courseName, sparkline, trending }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border-t-2 border-amber-500/60 p-4 group">
        <div className="absolute -right-3 -bottom-3 opacity-[0.07] group-hover:opacity-[0.12] transition-all duration-700 rotate-12 pointer-events-none">
          <Coins className="w-24 h-24 text-amber-400" />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: HERO_BANNER.amberGlow }} />
        <div className="relative z-10">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 mb-3">My Coins</p>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-black tracking-tighter text-amber-400 leading-none">{coins}</span>
            <span className="text-amber-500/60 text-xs font-bold mb-0.5">NC</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {trending
              ? <TrendingUp className="w-3 h-3 text-green-400" />
              : <TrendingDown className="w-3 h-3 text-red-400" />}
            <span className={`text-[10px] font-bold ${trending ? 'text-green-400' : 'text-red-400'}`}>
              {trending ? 'Rising' : 'Falling'}
            </span>
          </div>
          <Sparkline values={sparkline} color={trending ? TREND_HEX.up : TREND_HEX.down} />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border-t-2 border-emerald-500/60 p-4 group">
        <div className="absolute -right-3 -bottom-3 opacity-[0.07] group-hover:opacity-[0.12] transition-all duration-700 -rotate-12 pointer-events-none">
          <BookOpen className="w-24 h-24 text-emerald-400" />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: HERO_BANNER.emeraldGlow }} />
        <div className="relative z-10">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 mb-3">Class {courseName}</p>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-black tracking-tighter text-emerald-400 leading-none">{courseCoins}</span>
            <span className="text-emerald-500/60 text-xs font-bold mb-0.5">NC</span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2">class coins accumulated</p>
        </div>
      </div>
    </div>
  )
}
