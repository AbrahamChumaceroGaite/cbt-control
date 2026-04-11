'use client'
import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import type { StudentData } from '../../domain/types'

interface TooltipProps {
  active?:  boolean
  payload?: { value: number; payload: { change: number } }[]
  label?:   string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  const change = payload[0]?.payload?.change ?? 0
  return (
    <div className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-2.5 shadow-xl text-xs">
      <p className="text-zinc-400 mb-1">{label}</p>
      <p className="text-amber-400 font-bold">{payload[0]?.value} coins</p>
      {change !== 0 && (
        <p className={`font-semibold ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? '+' : ''}{change}
        </p>
      )}
    </div>
  )
}

interface Props {
  logs:         StudentData['coinLogs']
  currentCoins: number
}

export function TrajectoryChart({ logs, currentCoins }: Props) {
  const ordered = [...logs].reverse()
  if (ordered.length < 3) return (
    <p className="text-xs text-zinc-600 text-center py-4">Sin suficientes datos</p>
  )

  const cumul  = ordered.map(l => l.coins).reduce<number[]>((a, d) => { a.push((a.at(-1) ?? 0) + d); return a }, [])
  const offset = currentCoins - (cumul.at(-1) ?? 0)
  const series = cumul.map(v => v + offset)
  const trend  = series.at(-1)! >= series[0]
  const diff   = series.at(-1)! - series[0]

  // Thin data points for chart performance — max 30 ticks
  const step      = Math.max(1, Math.floor(ordered.length / 30))
  const chartData = ordered
    .filter((_, i) => i % step === 0 || i === ordered.length - 1)
    .map((l, idx) => {
      const origIdx = idx * step < ordered.length ? idx * step : ordered.length - 1
      return {
        date:   new Date(l.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }),
        coins:  series[Math.min(origIdx, series.length - 1)],
        change: ordered[Math.min(origIdx, ordered.length - 1)].coins,
      }
    })

  const color = trend ? '#4ade80' : '#f87171'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {trend ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
          <span className={`text-xs font-bold ${trend ? 'text-green-400' : 'text-red-400'}`}>
            {diff > 0 ? '+' : ''}{diff} coins
          </span>
        </div>
        <span className="text-[10px] text-zinc-600">{ordered.length} eventos</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: 'rgba(161,161,170,0.6)', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: 'rgba(161,161,170,0.6)', fontSize: 9 }} tickLine={false} axisLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="coins" stroke={color} strokeWidth={2} fill="url(#coinGrad)" dot={false}
            activeDot={{ r: 4, fill: '#fbbf24', stroke: '#1c1c1c', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
