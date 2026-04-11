'use client'
import { Modal, Button }       from '@/components/ui'
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
  const isApprove = modal.status === TRANSACTION_STATUS.APPROVED
  return (
    <Modal open title={isApprove ? '✓ Approve transaction' : '✗ Reject transaction'} onClose={onCancel} size="sm">
      <div className="space-y-4">
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
            variant={isApprove ? 'success' : 'destructive'}
            onClick={() => onConfirm(modal.id, modal.status, note)}
            loading={processing}
            className="flex-1"
          >
            {isApprove ? 'Confirm approval' : 'Confirm rejection'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
