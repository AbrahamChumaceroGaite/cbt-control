'use client'
import { LogOut } from 'lucide-react'

interface Props {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function LogoutModal({ open, onConfirm, onCancel }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl bg-red-500/90 text-sm font-bold text-white hover:bg-red-400 active:scale-95 transition-all"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
