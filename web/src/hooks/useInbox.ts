'use client'
import { useCallback, useEffect, useState } from 'react'
import { inboxService, type NotificationItem } from '@/services/inbox.service'

const POLL_INTERVAL_MS = 30_000 // re-fetch every 30 seconds

export function useInbox() {
  const [items,       setItems]       = useState<NotificationItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const res = await inboxService.getAll()
      setItems(res.items)
      setUnreadCount(res.unreadCount)
    } catch {
      // silently ignore (user may not be logged in yet)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load + poll
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [refresh])

  const markRead = useCallback(async (id: string) => {
    await inboxService.markRead(id).catch(() => {})
    setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

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

  return { items, unreadCount, loading, refresh, markRead, markAllRead, deleteOne, deleteAll }
}
