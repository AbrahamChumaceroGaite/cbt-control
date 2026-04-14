import { ChevronLeft, ChevronRight, Coins } from 'lucide-react'
import { DateFilterPopover }  from './DateFilterPopover'
import { formatDateTime }     from '@/lib/utils'
import { ACTION_CATEGORY, ACTION_CATEGORY_FALLBACK } from '@/config/scheme'
import type { CoinLogResponse } from '@control-aula/shared'
import type { DateFilter }    from '../../domain/types'

interface Props {
  filteredLogs: CoinLogResponse[]
  pagedLogs:    CoinLogResponse[]
  page:         number
  totalPages:   number
  dateFilter:   DateFilter | null
  onPageChange:    (page: number) => void
  onFilterApply:   (f: DateFilter) => void
  onFilterClear:   () => void
}

export function CoinHistory({ filteredLogs, pagedLogs, page, totalPages, dateFilter, onPageChange, onFilterApply, onFilterClear }: Props) {
  return (
    <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/60 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">History</p>
          {filteredLogs.length > 0 && (
            <span className="text-[10px] text-zinc-600">{filteredLogs.length} records</span>
          )}
        </div>
        <DateFilterPopover
          filter={dateFilter}
          onApply={onFilterApply}
          onClear={onFilterClear}
        />
      </div>

      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
            <Coins className="w-4 h-4 text-zinc-600" />
          </div>
          <p className="text-xs text-zinc-600">No movements{dateFilter ? ' in that period' : ''}</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-zinc-800/40">
            {pagedLogs.map(log => {
              const cat = log.action?.category ?? ''
              const c   = ACTION_CATEGORY[cat as keyof typeof ACTION_CATEGORY] ?? ACTION_CATEGORY_FALLBACK
              const pos = log.coins >= 0
              return (
                <div key={log.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors group">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${c.bg} ${c.border}`}>
                    <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 font-semibold truncate leading-tight">{log.action?.name ?? log.reason}</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">{formatDateTime(log.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-base font-black ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pos ? '+' : ''}{log.coins}
                    </span>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{pos ? 'Coins' : 'Spent'}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800/60">
              <button onClick={() => onPageChange(Math.max(0, page - 1))} disabled={page === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-500">{page + 1} / {totalPages}</span>
              <button onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
