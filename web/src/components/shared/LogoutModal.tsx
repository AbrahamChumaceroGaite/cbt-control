'use client'
import { LogOut }   from 'lucide-react'
import { Button }   from '@/components/ui'
import { Z }        from '@/config/scheme'

interface Props {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function LogoutModal({ open, onConfirm, onCancel }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: Z.DRAWER }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-xs rounded-2xl bg-zinc-900 border border-zinc-800/60 shadow-2xl p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">¿Cerrar sesión?</h3>
            <p className="text-xs text-zinc-500 mt-1">Se cerrará tu sesión en este dispositivo.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1 h-10">Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1 h-10">Cerrar sesión</Button>
        </div>
      </div>
    </div>
  )
}
