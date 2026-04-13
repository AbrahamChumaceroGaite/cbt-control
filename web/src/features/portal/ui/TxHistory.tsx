'use client'
import { useState }        from 'react'
import { ChevronLeft, ChevronRight, Coins, Send } from 'lucide-react'
import { StatusBadge }     from '@/components/ui'
import { FilterPills }     from '@/components/shared/FilterPills'
import { TX_DIRECTION }    from '@/config/scheme'
import { formatDate }      from '@/lib/utils'
import type { CoinTransactionResponse, HistoryFilter } from '../domain/types'

const TX_FILTER_OPTIONS: { value: HistoryFilter; label: string }[] = [
  { value: 'all',      label: 'All'      },
  { value: 'sent',     label: 'Sent'     },
  { value: 'received', label: 'Received' },
]

const PAGE = 5

interface Props { txs: CoinTransactionResponse[]; myStudentId: string }

export function TxHistory({ txs, myStudentId }: Props) {
  const [filter, setFilter] = useState<HistoryFilter>('all')
  const [page,   setPage]   = useState(0)

  const filtered = txs.filter(tx => {
    if (filter === 'sent')     return tx.fromStudent.id === myStudentId
    if (filter === 'received') return tx.toStudent.id   === myStudentId
    return true
  })
  const totalPages = Math.ceil(filtered.length / PAGE)
  const paged      = filtered.slice(page * PAGE, (page + 1) * PAGE)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FilterPills options={TX_FILTER_OPTIONS} value={filter} onChange={v => { setFilter(v); setPage(0) }} />
        <span className="ml-auto text-[10px] text-zinc-600 flex-shrink-0">{filtered.length} txs</span>
      </div>

      {paged.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
            <Coins className="w-4 h-4 text-zinc-600" />
          </div>
          <p className="text-xs text-zinc-600">No transactions</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paged.map(tx => {
              const isSent = tx.fromStudent.id === myStudentId
              const other  = isSent ? tx.toStudent : tx.fromStudent
              const dir    = TX_DIRECTION[isSent ? 'sent' : 'received']
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:bg-zinc-900/80 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${dir.icon}`}>
                    <Send className={`w-4 h-4 ${dir.text} ${dir.rotate}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{isSent ? `→ ${other.name}` : `← ${other.name}`}</p>
                    <p className="text-[10px] text-zinc-600">{other.courseName} · {formatDate(tx.createdAt)}</p>
                    {tx.notes && <p className="text-[10px] text-zinc-500 truncate mt-0.5 italic">&ldquo;{tx.notes}&rdquo;</p>}
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <p className={`text-sm font-black ${dir.text}`}>
                      {isSent ? '-' : '+'}{isSent ? tx.amount + tx.tax : tx.amount}
                    </p>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              )
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-500">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
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
