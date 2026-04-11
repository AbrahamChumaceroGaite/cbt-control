import * as React from 'react'
import { X }      from 'lucide-react'
import { cn }     from '@/lib/utils'
import { Button } from './button'
import { Z }      from '@/config/scheme'

export function Modal({ open, onClose, title, lg, children }: {
  open:     boolean
  onClose:  () => void
  title:    string
  lg?:      boolean
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4" style={{ zIndex: Z.MODAL }}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative w-full rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col max-h-[90vh]',
        lg ? 'max-w-2xl' : 'max-w-md'
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
