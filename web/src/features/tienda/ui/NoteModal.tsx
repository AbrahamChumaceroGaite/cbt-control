'use client'
import { Button }              from '@/components/ui'
import type { NoteModalState } from '../domain/types'
import { TRANSACTION_STATUS }  from '@/config/status'

interface Props {
  modal:      NoteModalState
  note:       string
  processing: boolean
  onNote:     (n: string) => void
  onCancel:   () => void
  onConfirm:  (id: string, status: 'approved' | 'rejected', note: string) => void
}

export function NoteModal({ modal, note, processing, onNote, onCancel, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-zinc-200">
          {modal.status === TRANSACTION_STATUS.APPROVED ? '✓ Approve transaction' : '✗ Reject transaction'}
        </h3>
        <div className="space-y-1.5">
          <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={e => onNote(e.target.value)}
            placeholder="Reason or comment…"
            className="w-full h-9 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/40"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button
            variant={modal.status === TRANSACTION_STATUS.APPROVED ? 'success' : 'destructive'}
            onClick={() => onConfirm(modal.id, modal.status, note)}
            loading={processing}
            className="flex-1"
          >
            {modal.status === TRANSACTION_STATUS.APPROVED ? 'Confirm approval' : 'Confirm rejection'}
          </Button>
        </div>
      </div>
    </div>
  )
}
