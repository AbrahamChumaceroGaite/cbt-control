'use client'
import { BellDot } from 'lucide-react'

interface Props {
  onEnable:  () => void
  onDismiss: () => void
}

export function PushPrompt({ onEnable, onDismiss }: Props) {
  return (
    <div className="mx-3 my-2 p-3.5 rounded-xl border border-amber-500/20 flex items-start gap-3"
      style={{ background: 'rgba(245,158,11,0.05)' }}>
      <BellDot className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-200 leading-tight">Activar notificaciones</p>
        <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">Recibe alertas en tiempo real aunque no tengas la app abierta.</p>
        <div className="flex gap-2 mt-2.5">
          <button onClick={onEnable}  className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors">Activar</button>
          <button onClick={onDismiss} className="text-[11px] font-medium px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">Ahora no</button>
        </div>
      </div>
    </div>
  )
}
