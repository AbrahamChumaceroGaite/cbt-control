'use client'
import { Modal }   from '@/components/ui/modal'
import { Button }  from '@/components/ui/button'

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
  open, onConfirm, onCancel, title, message,
  confirmText = 'Confirmar',
  cancelText  = 'Cancelar',
  variant     = 'amber',
  loading     = false,
  icon,
}: Props) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        {icon && <div className="flex justify-center pt-1">{icon}</div>}
        {message && <p className="text-sm text-zinc-400 leading-relaxed">{message}</p>}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl text-xs"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'red' ? 'destructive' : 'amber'}
            onClick={onConfirm}
            loading={loading}
            className="flex-1 h-10 rounded-xl text-xs font-bold"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
