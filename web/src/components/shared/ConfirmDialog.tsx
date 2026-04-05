'use client'
import { Modal } from '@/components/ui'

interface Props {
  open:         boolean
  onConfirm:    () => void
  onCancel:     () => void
  title:        string
  message?:     string
  confirmText?: string
  cancelText?:  string
  /** 'amber' for normal actions, 'red' for destructive ones */
  variant?:     'amber' | 'red'
  loading?:     boolean
  icon?:        React.ReactNode
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText  = 'Confirmar',
  cancelText   = 'Cancelar',
  variant      = 'amber',
  loading      = false,
  icon,
}: Props) {
  const btnClass = variant === 'red'
    ? 'bg-red-600 hover:bg-red-500 text-white'
    : 'bg-amber-500 hover:bg-amber-400 text-zinc-900'

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        {icon && (
          <div className="flex justify-center pt-1">{icon}</div>
        )}
        {message && (
          <p className="text-sm text-zinc-400 leading-relaxed">{message}</p>
        )}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-10 rounded-xl text-xs font-bold transition-colors disabled:opacity-60 ${btnClass}`}
          >
            {loading ? 'Procesando…' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
