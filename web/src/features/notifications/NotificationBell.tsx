'use client'
import { useEffect, useRef, useState }        from 'react'
import { Bell, BellOff, BellRing, Check, CheckCheck, Loader2, Trash2, X } from 'lucide-react'
import { useInbox }              from '@/hooks/useInbox'
import { usePushNotifications }  from '@/hooks/usePushNotifications'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1)  return 'Ahora'
  if (m < 60) return `Hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

// ── Push toggle button ────────────────────────────────────────────────────────

function PushToggle() {
  const { state, subscribe, unsubscribe } = usePushNotifications()

  if (state === 'unsupported') return null

  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Loader2 className="w-3 h-3 animate-spin" />
        Verificando notificaciones…
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <BellOff className="w-3 h-3" />
        Push bloqueado en el navegador
      </div>
    )
  }

  return (
    <button
      onClick={state === 'subscribed' ? unsubscribe : subscribe}
      className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${
        state === 'subscribed'
          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
          : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200 hover:bg-zinc-700'
      }`}
    >
      {state === 'subscribed' ? <BellRing className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
      {state === 'subscribed' ? 'Push activo' : 'Activar push'}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  /** Extra class applied to the trigger button */
  triggerClass?: string
}

export function NotificationBell({ triggerClass = '' }: Props) {
  const { items, unreadCount, loading, markRead, markAllRead, deleteOne, deleteAll } = useInbox()
  const [open, setOpen] = useState(false)
  const panelRef        = useRef<HTMLDivElement>(null)
  const triggerRef      = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (
        !panelRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Mark unread as read when panel opens
  const handleOpen = () => {
    setOpen(v => !v)
  }

  return (
    <div className="relative">
      {/* ── Trigger ──────────────────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        onClick={handleOpen}
        title="Notificaciones"
        className={`relative p-2 rounded-lg transition-colors ${
          open
            ? 'bg-zinc-700 text-zinc-100'
            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
        } ${triggerClass}`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-amber-500 text-black text-[9px] font-black rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Panel ────────────────────────────────────────────────────────── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-[calc(100%+8px)] w-[380px] max-h-[520px] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60 z-[300] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-semibold text-zinc-100">Notificaciones</span>
              {unreadCount > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {items.some(n => !n.isRead) && (
                <button
                  onClick={markAllRead}
                  title="Marcar todas como leídas"
                  className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {items.length > 0 && (
                <button
                  onClick={deleteAll}
                  title="Eliminar todas"
                  className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Push toggle */}
          <div className="px-4 py-2.5 border-b border-zinc-800/50 flex-shrink-0">
            <PushToggle />
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-zinc-600">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-600">
                <Bell className="w-8 h-8 opacity-30" />
                <span className="text-sm">Sin notificaciones</span>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800/50">
                {items.map(n => (
                  <li
                    key={n.id}
                    className={`group flex gap-3 px-4 py-3 transition-colors hover:bg-zinc-900/60 ${
                      !n.isRead ? 'bg-zinc-900/30' : ''
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="flex-shrink-0 mt-1.5">
                      {!n.isRead
                        ? <div className="w-2 h-2 rounded-full bg-amber-400" />
                        : <div className="w-2 h-2 rounded-full bg-zinc-800" />
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-tight truncate ${n.isRead ? 'text-zinc-400' : 'text-zinc-100'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-zinc-600 flex-shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{n.body}</p>
                    </div>

                    {/* Per-item actions */}
                    <div className="flex-shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <button
                          onClick={() => markRead(n.id)}
                          title="Marcar como leída"
                          className="p-1 text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteOne(n.id)}
                        title="Eliminar"
                        className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
