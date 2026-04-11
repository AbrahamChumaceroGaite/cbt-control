'use client'
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
          <button onClick={onCancel} className="flex-1 h-9 rounded-xl border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(modal.id, modal.status, note)}
            disabled={processing}
            className={`flex-1 h-9 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${
              modal.status === TRANSACTION_STATUS.APPROVED ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-red-600 text-white hover:bg-red-500'
            }`}
          >
            {processing ? 'Processing…' : modal.status === TRANSACTION_STATUS.APPROVED ? 'Confirm approval' : 'Confirm rejection'}
          </button>
        </div>
      </div>
    </div>
  )
}
