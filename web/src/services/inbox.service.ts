import { apiFetch } from '@/lib/api'

export interface NotificationItem {
  id:        string
  title:     string
  body:      string
  url:       string
  tag:       string
  isRead:    boolean
  createdAt: string
}

export interface InboxResult {
  items:       NotificationItem[]
  unreadCount: number
}

export const inboxService = {
  getAll: () =>
    apiFetch<InboxResult>('/api/notifications'),

  markRead: (id: string) =>
    apiFetch<void>(`/api/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    apiFetch<void>('/api/notifications/batch', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'mark-all-read' }),
    }),

  deleteOne: (id: string) =>
    apiFetch<void>(`/api/notifications/${id}`, { method: 'DELETE' }),

  deleteMany: (ids: string[]) =>
    apiFetch<void>('/api/notifications/batch', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'delete-many', ids }),
    }),

  deleteAll: () =>
    apiFetch<void>('/api/notifications/batch', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'delete-all' }),
    }),
}
