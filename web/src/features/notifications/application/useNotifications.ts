'use client'
import { useEffect, useRef, useState } from 'react'
import { useInbox }                    from '@/hooks/useInbox'
import { usePushNotifications }        from '@/hooks/usePushNotifications'
import { useSocketEvent }              from '@/hooks/useSocketEvent'
import { WS }                          from '@/ws/events'
import type { Severity }               from '@/hooks/useInbox'

const DISMISSED_KEY = 'push_prompt_dismissed'
const INBOX_PAGE    = 10

export function inferSeverity(title: string, body: string): Severity {
  const t = (title + ' ' + body).toLowerCase()
  if (/penali|resta|sanción|error|elimina|baja|pierde/.test(t)) return 'negative'
  if (/recompensa|premio|ganó|ganaste|felicit|logro|suma|añad/.test(t)) return 'positive'
  if (/grupo|integrante|se unió|nuevo|registr|creó/.test(t))            return 'info'
  return 'default'
}

export function useNotifications() {
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

  return {
    items, unreadCount, loading, error,
    markRead, markAllRead, deleteOne, deleteAll,
    open, setOpen, visibleCount, setVisibleCount,
    promptVisible, pushState,
    panelRef, triggerRef,
    handleEnable, handleDismiss,
    inboxPage: INBOX_PAGE,
  }
}
