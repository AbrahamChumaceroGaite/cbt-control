'use client'
import { useState } from 'react'
import { Clock }    from 'lucide-react'
import { useInterval } from '@/hooks/useInterval'

export function DateTimeChip() {
  const [now, setNow] = useState(new Date())
  // Delay=null would pause without unmounting — 1000ms keeps clock in sync
  useInterval(() => setNow(new Date()), 1000)

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/50 backdrop-blur-xl border border-white/[0.07]">
      <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
      <div>
        <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold leading-none mb-0.5">
          {now.toLocaleDateString('es-BO', { weekday: 'short', day: '2-digit', month: 'short' })}
        </p>
        <p className="font-mono text-xs font-semibold text-white leading-none">
          {now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
