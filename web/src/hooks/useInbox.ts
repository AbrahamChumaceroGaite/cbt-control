'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { inboxService, type NotificationItem } from '@/services/inbox.service'

const POLL_MS = 30_000

export function useInbox() {
  const [items,       setItems]       = useState<NotificationItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await inboxService.getAll()
      setItems(res.items)
      setUnreadCount(res.unreadCount)
      setError(null)
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    timerRef.current = setInterval(refresh, POLL_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [refresh])

  const markRead = useCallback(async (id: string) => {
    const item = items.find(n => n.id === id)
    await inboxService.markRead(id).catch(() => {})
    setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    if (item && !item.isRead) setUnreadCount(prev => Math.max(0, prev - 1))
  }, [items])

  const markAllRead = useCallback(async () => {
    await inboxService.markAllRead().catch(() => {})
    setItems(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }, [])

  const deleteOne = useCallback(async (id: string) => {
    const wasUnread = items.find(n => n.id === id)?.isRead === false
    await inboxService.deleteOne(id).catch(() => {})
    setItems(prev => prev.filter(n => n.id !== id))
    if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
  }, [items])

  const deleteAll = useCallback(async () => {
    await inboxService.deleteAll().catch(() => {})
    setItems([])
    setUnreadCount(0)
  }, [])

  return { items, unreadCount, loading, error, refresh, markRead, markAllRead, deleteOne, deleteAll }
}
