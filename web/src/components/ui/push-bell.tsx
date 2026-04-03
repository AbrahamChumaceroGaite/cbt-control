'use client'
import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

interface Props {
  className?: string
}

const TITLES: Record<string, string> = {
  unsupported:  'Notificaciones no soportadas',
  denied:       'Notificaciones bloqueadas en el navegador',
  loading:      'Cargando…',
  subscribed:   'Notificaciones activas — clic para desactivar',
  unsubscribed: 'Activar notificaciones',
}

export function PushBell({ className = '' }: Props) {
  const { state, subscribe, unsubscribe } = usePushNotifications()

  if (state === 'unsupported') return null

  const base = `p-2 rounded-lg transition-colors ${className}`

  if (state === 'loading') {
    return (
      <div className={`${base} text-zinc-600 cursor-default`} title="Cargando…">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className={`${base} text-zinc-600 cursor-not-allowed`} title={TITLES.denied}>
        <BellOff className="w-4 h-4" />
      </div>
    )
  }

  if (state === 'subscribed') {
    return (
      <button
        onClick={unsubscribe}
        title={TITLES.subscribed}
        className={`${base} text-amber-400 hover:text-amber-200 hover:bg-zinc-800`}
      >
        <BellRing className="w-4 h-4" />
      </button>
    )
  }

  // unsubscribed
  return (
    <button
      onClick={subscribe}
      title={TITLES.unsubscribed}
      className={`${base} text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800`}
    >
      <Bell className="w-4 h-4" />
    </button>
  )
}
