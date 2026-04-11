'use client'
import { Shield } from 'lucide-react'
import type { WeeklyBankStatus } from '../domain/types'

export function WeeklyBar({ status }: { status: WeeklyBankStatus }) {
  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">Límite Semanal</span>
        </div>
        <span className={`text-xs font-black ${status.remaining === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {status.remaining} restante{status.remaining !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: status.limit }).map((_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-500 ${i < status.used ? 'bg-amber-500' : 'bg-zinc-800'}`} />
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 mt-2">
        {status.used}/{status.limit} transacciones usadas esta semana · Se resetean el lunes
      </p>
    </div>
  )
}
