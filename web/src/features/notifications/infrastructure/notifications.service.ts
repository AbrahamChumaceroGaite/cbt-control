import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { InboxResult } from '../domain/types'

export const notificationsService = {
  getAll: () =>
    api<InboxResult>(API_ROUTES.NOTIFICATIONS.BASE).then(r => r.data),

  markRead: (id: string) =>
    api<void>(API_ROUTES.NOTIFICATIONS.READ(id), { method: 'PATCH' }).then(r => r.data),

  markAllRead: () =>
    api<void>(API_ROUTES.NOTIFICATIONS.BATCH, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'mark-all-read' }),
    }).then(r => r.data),

  deleteOne: (id: string) =>
    api<void>(API_ROUTES.NOTIFICATIONS.BY_ID(id), { method: 'DELETE' }).then(r => r.data),

  deleteAll: () =>
    api<void>(API_ROUTES.NOTIFICATIONS.BATCH, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'delete-all' }),
    }).then(r => r.data),

  adminGetUserInbox: (userId: string) =>
    api<InboxResult>(API_ROUTES.NOTIFICATIONS.ADMIN(userId)).then(r => r.data),
}
