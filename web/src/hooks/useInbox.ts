'use client'
// uses socket — subscribes to WS.NOTIFICATION_NEW via NotificationBell
import { useCallback, useState }    from 'react'
import { notificationsService }     from '@/features/notifications/infrastructure/notifications.service'
import { useInterval }              from '@/hooks/useInterval'
import { POLL_MS }                  from '@/config/ui'
import type { NotificationItem, Severity } from '@/features/notifications/domain/types'

export type { NotificationItem, Severity }

export function useInbox() {
  const [items,       setItems]       = useState<NotificationItem[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const res = await notificationsService.getAll()
      setItems(res.items)
      setUnreadCount(res.unreadCount)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  // Poll every POLL_MS — delay=null would pause without unmounting
  useInterval(refresh, POLL_MS)

  const markRead = useCallback(async (id: string) => {
    const item = items.find(n => n.id === id)
    await notificationsService.markRead(id).catch(() => {})
    setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    if (item && !item.isRead) setUnreadCount(prev => Math.max(0, prev - 1))
  }, [items])

  const markAllRead = useCallback(async () => {
    await notificationsService.markAllRead().catch(() => {})
    setItems(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }, [])

  const deleteOne = useCallback(async (id: string) => {
    const wasUnread = items.find(n => n.id === id)?.isRead === false
    await notificationsService.deleteOne(id).catch(() => {})
    setItems(prev => prev.filter(n => n.id !== id))
    if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
  }, [items])

  const deleteAll = useCallback(async () => {
    await notificationsService.deleteAll().catch(() => {})
    setItems([])
    setUnreadCount(0)
  }, [])

  return { items, unreadCount, loading, error, refresh, markRead, markAllRead, deleteOne, deleteAll }
}
