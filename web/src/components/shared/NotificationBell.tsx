'use client'
import { useEffect, useRef, useState }              from 'react'
import { Bell, CheckCheck, Trash2, X, AlertCircle } from 'lucide-react'
import { Skeleton, Button }      from '@/components/ui'
import { useInbox }              from '@/hooks/useInbox'
import { usePushNotifications }  from '@/hooks/usePushNotifications'
import { useSocketEvent }        from '@/hooks/useSocketEvent'
import { WS }                   from '@/ws/events'
import { PushPrompt }           from './PushPrompt'
import { NotificationItem }     from './NotificationItem'
import type { Severity }        from '@/hooks/useInbox'

function inferSeverity(title: string, body: string): Severity {
  const t = (title + ' ' + body).toLowerCase()
  if (/penali|resta|sanción|error|elimina|baja|pierde/.test(t)) return 'negative'
  if (/recompensa|premio|ganó|ganaste|felicit|logro|suma|añad/.test(t)) return 'positive'
  if (/grupo|integrante|se unió|nuevo|registr|creó/.test(t))            return 'info'
  return 'default'
}

const DISMISSED_KEY = 'push_prompt_dismissed'
const INBOX_PAGE    = 10

export function NotificationBell() {
  const { items, unreadCount, loading, error, refresh, markRead, markAllRead, deleteOne, deleteAll } = useInbox()
  const { state: pushState, requestAndSubscribe } = usePushNotifications()
  const [open,          setOpen]          = useState(false)
  const [visibleCount,  setVisibleCount]  = useState(INBOX_PAGE)
  const [promptVisible, setPromptVisible] = useState(false)
  const panelRef   = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useSocketEvent(WS.NOTIFICATION_NEW, () => { refresh() })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    setPromptVisible(pushState === 'unsubscribed' && typeof Notification !== 'undefined' && Notification.permission === 'default' && !dismissed)
  }, [pushState, open])

  useEffect(() => {
    if (open) setVisibleCount(INBOX_PAGE)
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleEnable()  { requestAndSubscribe().finally(() => { setPromptVisible(false); localStorage.setItem(DISMISSED_KEY, '1') }) }
  function handleDismiss() { setPromptVisible(false); localStorage.setItem(DISMISSED_KEY, '1') }

  return (
    <div className="relative">
      <button ref={triggerRef} onClick={() => setOpen(v => !v)} title="Notificaciones"
        className={`relative p-2 rounded-lg transition-colors ${open ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}>
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-[wiggle_0.6s_ease-in-out_1]' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-amber-500 text-black text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div ref={panelRef} className="absolute right-0 top-[calc(100%+8px)] w-[calc(100vw-1rem)] max-w-[360px] max-h-[520px] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60 z-[300] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-100">Notificaciones</span>
              {unreadCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold">{unreadCount} nueva{unreadCount !== 1 ? 's' : ''}</span>}
            </div>
            <div className="flex items-center gap-0.5">
              {items.some(n => !n.isRead) && <button onClick={markAllRead} title="Marcar todas como leídas" className="p-1.5 text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"><CheckCheck className="w-3.5 h-3.5" /></button>}
              {items.length > 0 && <button onClick={deleteAll} title="Eliminar todas" className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
              <button onClick={() => setOpen(false)} className="p-1.5 text-zinc-700 hover:text-zinc-400 hover:bg-zinc-800 rounded-lg transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          {promptVisible && <PushPrompt onEnable={handleEnable} onDismiss={handleDismiss} />}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 px-1 py-1">
                    <Skeleton className="w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2.5 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-2 py-10 text-zinc-600 px-4 text-center">
                <AlertCircle className="w-6 h-6" /><span className="text-xs">{error}</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-zinc-700">
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
                  <Bell className="w-5 h-5 opacity-40" />
                </div>
                <span className="text-xs text-zinc-600">Sin notificaciones</span>
              </div>
            ) : (
              <>
                <ul>{items.slice(0, visibleCount).map(n => <NotificationItem key={n.id} item={n} severity={inferSeverity(n.title, n.body)} onMarkRead={markRead} onDelete={deleteOne} />)}</ul>
                {visibleCount < items.length && (
                  <Button
                    variant="ghost"
                    onClick={() => setVisibleCount(c => c + INBOX_PAGE)}
                    className="w-full py-2.5 h-auto text-zinc-500 hover:text-amber-400 hover:bg-zinc-900/40 border-t border-zinc-800/40 rounded-none"
                  >
                    Cargar más ({items.length - visibleCount} restantes)
                  </Button>
                )}
              </>
            )}
          </div>
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
