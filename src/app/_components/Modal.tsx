'use client'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Modal({ open, onClose, title, lg, children }: {
  open: boolean; onClose: () => void; title: string; lg?: boolean; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={cn('modal-content', lg && 'max-w-2xl')} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {title}
            <button onClick={onClose} className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              <X size={18} />
            </button>
          </h2>
        </div>
        <div className="modal-body space-y-4">{children}</div>
      </div>
    </div>
  )
}
