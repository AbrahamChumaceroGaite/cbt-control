'use client'
import { useEffect, useRef, useState }      from 'react'
import { Bell, BellDot, Check, CheckCheck, Loader2, Trash2, X, AlertCircle } from 'lucide-react'
import { useInbox }             from '@/hooks/useInbox'
import { usePushNotifications } from '@/hooks/usePushNotifications'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (m < 1)  return 'Ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

// ── Permission prompt (shown once when permission is 'default') ───────────────

function PushPrompt({ onEnable, onDismiss }: { onEnable: () => void; onDismiss: () => void }) {
  return (
    <div className="mx-3 my-2 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20 flex items-start gap-3">
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

// ── Main ──────────────────────────────────────────────────────────────────────

const DISMISSED_KEY = 'push_prompt_dismissed'

export function NotificationBell() {
  const { items, unreadCount, loading, error, markRead, markAllRead, deleteOne, deleteAll } = useInbox()
  const { state: pushState, requestAndSubscribe } = usePushNotifications()
  const [open,          setOpen]          = useState(false)
  const [promptVisible, setPromptVisible] = useState(false)
  const panelRef   = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Show prompt only when: permission is default AND not previously dismissed
  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    setPromptVisible(
      pushState === 'unsubscribed' &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default' &&
      !dismissed,
    )
  }, [pushState, open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node) &&
          !triggerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function handleEnable() {
    const ok = await requestAndSubscribe()
    if (ok || !ok) setPromptVisible(false) // hide regardless of outcome
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  function handleDismiss() {
    setPromptVisible(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(v => !v)}
        title="Notificaciones"
        className={`relative p-2 rounded-lg transition-colors ${
          open ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-amber-500 text-black text-[9px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-[calc(100%+8px)] w-[360px] max-h-[520px] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60 z-[300] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-100">Notificaciones</span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold">{unreadCount} nueva{unreadCount !== 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              {items.some(n => !n.isRead) && (
                <button onClick={markAllRead} title="Marcar todas como leídas" className="p-1.5 text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors">
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {items.length > 0 && (
                <button onClick={deleteAll} title="Eliminar todas" className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 text-zinc-700 hover:text-zinc-400 hover:bg-zinc-800 rounded-lg transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Push prompt (contextual — not a persistent button) */}
          {promptVisible && <PushPrompt onEnable={handleEnable} onDismiss={handleDismiss} />}

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-zinc-700">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-2 py-10 text-zinc-600 px-4 text-center">
                <AlertCircle className="w-6 h-6" />
                <span className="text-xs">{error}</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-zinc-700">
                <Bell className="w-7 h-7 opacity-30" />
                <span className="text-xs">Sin notificaciones</span>
              </div>
            ) : (
              <ul>
                {items.map(n => (
                  <li key={n.id} className={`group flex gap-3 px-4 py-3 border-b border-zinc-800/40 last:border-0 hover:bg-zinc-900/60 transition-colors ${!n.isRead ? 'bg-zinc-900/25' : ''}`}>
                    <div className="flex-shrink-0 mt-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${!n.isRead ? 'bg-amber-400' : 'bg-zinc-800'}`} />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !n.isRead && markRead(n.id)}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-tight ${n.isRead ? 'text-zinc-400' : 'text-zinc-100'}`}>{n.title}</p>
                        <span className="text-[10px] text-zinc-600 flex-shrink-0">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{n.body}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <button onClick={() => markRead(n.id)} title="Leída" className="p-1 text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors">
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      <button onClick={() => deleteOne(n.id)} title="Eliminar" className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer: push status (only when subscribed, no button) */}
          {pushState === 'subscribed' && (
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-zinc-800/50 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-zinc-600">Notificaciones push activas</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
