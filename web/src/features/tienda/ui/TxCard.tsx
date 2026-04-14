'use client'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { StatusBadge, Button }  from '@/components/ui'
import { formatDateTime }       from '@/lib/utils'
import { TRANSACTION_STATUS }   from '@/config/status'
import type { CoinTransactionResponse } from '@control-aula/shared'
import type { NoteModalState } from '../domain/types'

interface Props {
  tx:          CoinTransactionResponse
  processing:  string | null
  onOpenModal: (s: NoteModalState) => void
}

export function TxCard({ tx, processing, onOpenModal }: Props) {
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-4 ${tx.status === TRANSACTION_STATUS.PENDING ? 'bg-zinc-900/80 border-amber-500/20' : 'bg-zinc-900/40 border-zinc-800'}`}>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-center">
          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300">
            {tx.fromStudent.name.charAt(0)}
          </div>
          <p className="text-[9px] text-zinc-600 mt-0.5 max-w-[48px] truncate">{tx.fromStudent.name.split(' ')[0]}</p>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-black text-amber-400">{tx.amount}c</span>
          <ArrowRight className="w-4 h-4 text-zinc-600" />
          <span className="text-[9px] text-zinc-600">+{tx.tax}c tax</span>
        </div>
        <div className="text-center">
          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300">
            {tx.toStudent.name.charAt(0)}
          </div>
          <p className="text-[9px] text-zinc-600 mt-0.5 max-w-[48px] truncate">{tx.toStudent.name.split(' ')[0]}</p>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-200 truncate">{tx.fromStudent.name} → {tx.toStudent.name}</p>
        <p className="text-[10px] text-zinc-500">
          {tx.fromStudent.courseName} · {formatDateTime(tx.createdAt)}
        </p>
        {tx.notes      && <p className="text-[10px] text-zinc-500 italic truncate">&ldquo;{tx.notes}&rdquo;</p>}
        {tx.adminNotes && <p className="text-[10px] text-zinc-600 truncate">Admin: {tx.adminNotes}</p>}
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <StatusBadge status={tx.status} />
        {tx.status === TRANSACTION_STATUS.PENDING && (
          <div className="flex gap-1.5">
            <Button
              variant="outline" size="sm"
              className="h-7 px-2.5 text-emerald-400 border-emerald-500/25 bg-emerald-500/15 hover:bg-emerald-500/25 hover:border-emerald-500/40 hover:text-emerald-400"
              onClick={() => onOpenModal({ id: tx.id, status: 'approved' })}
              disabled={!!processing}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </Button>
            <Button
              variant="destructive" size="sm"
              className="h-7 px-2.5"
              onClick={() => onOpenModal({ id: tx.id, status: 'rejected' })}
              disabled={!!processing}
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
