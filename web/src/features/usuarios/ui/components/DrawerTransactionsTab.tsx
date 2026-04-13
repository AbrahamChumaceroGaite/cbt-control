import { ArrowRight, Landmark } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { formatDate } from '@/lib/utils'
import { STATUS_BADGE, STATUS_LABEL, TX_DIRECTION } from '@/config/scheme'
import type { UserViewModel } from '../../domain/types'
import type { CoinTransactionResponse } from '@control-aula/shared'

interface Props {
  user:         UserViewModel
  transactions: CoinTransactionResponse[]
  loading:      boolean
}

export function DrawerTransactionsTab({ user, transactions, loading }: Props) {
  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-zinc-700">
        <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
          <Landmark className="w-5 h-5 opacity-40" />
        </div>
        <span className="text-xs text-zinc-600">No transactions</span>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-zinc-800/40">
      {transactions.map(tx => {
        const isFrom  = tx.fromStudent.id === user.student?.id
        const other   = isFrom ? tx.toStudent : tx.fromStudent
        const dir     = TX_DIRECTION[isFrom ? 'sent' : 'received']
        const stKey   = tx.status as keyof typeof STATUS_LABEL
        const badgeCls = STATUS_BADGE[stKey] ?? STATUS_BADGE.pending
        const stLabel  = STATUS_LABEL[stKey] ?? STATUS_LABEL.pending
        return (
          <li key={tx.id} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${dir.icon}`}>
              <ArrowRight className={`w-3.5 h-3.5 ${dir.text} ${isFrom ? 'rotate-180' : ''}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {isFrom ? `→ ${other.name}` : `← ${other.name}`}
              </p>
              <p className="text-[10px] text-zinc-600">{formatDate(tx.createdAt)}</p>
            </div>
            <div className="text-right flex-shrink-0 space-y-1">
              <p className={`text-sm font-black ${dir.text}`}>
                {isFrom ? '-' : '+'}{isFrom ? tx.amount + tx.tax : tx.amount}c
              </p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badgeCls}`}>{stLabel}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
