import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CoinLogResponse } from '@control-aula/shared'

export function RecentHistory({ logs }: { logs: CoinLogResponse[] }) {
  return (
    <div className="card-base p-6 flex flex-col">
      <h3 className="panel-title flex items-center gap-2">
        <TrendingUp className="w-[18px] h-[18px] text-rose-400" /> Historial Reciente
      </h3>
      <p className="panel-subtitle">Últimas acciones del curso.</p>
      <div className="flex-1 space-y-2 mt-3 overflow-y-auto max-h-[360px] pr-1">
        {logs.length === 0 && (
          <div className="text-zinc-500 text-sm text-center py-8">No se han registrado acciones.</div>
        )}
        {logs.slice(0, 15).map(l => {
          const stName = l.student?.name?.split(' ')[0]
          return (
            <div key={l.id} className="flex items-start gap-3 p-2 group">
              <div className="mt-1.5 flex-shrink-0">
                <div className={cn(
                  'w-2 h-2 rounded-full ring-4 ring-zinc-950 group-hover:ring-zinc-900 transition-colors',
                  l.coins > 0 ? 'bg-emerald-500' : l.coins === 0 ? 'bg-blue-500' : 'bg-rose-500'
                )} />
              </div>
              <p className="text-xs text-zinc-300 break-words flex-1">
                {stName
                  ? <span className="font-semibold text-white">{stName}</span>
                  : <span className="font-semibold text-blue-300">Clase</span>}
                {' '}
                <span className={cn('font-medium',
                  l.coins > 0 ? 'text-emerald-400' : l.coins === 0 ? 'text-blue-400' : 'text-rose-400'
                )}>
                  {l.coins > 0 ? '+' : ''}{l.coins} coins
                </span>
                <span className="text-zinc-500"> por </span>{l.reason}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
