import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { UserDetailResponse, UserCreateInput, CoinTransactionResponse } from '@control-aula/shared'
import type { NotificationItem }  from '../domain/types'

type UserUpdateBody = { fullName?: string; isActive?: boolean; password?: string }

interface InboxResult {
  items:       NotificationItem[]
  unreadCount: number
}

export const usuariosService = {
  getAll: () =>
    api<UserDetailResponse[]>(API_ROUTES.USERS.BASE).then(r => r.data),

  create: (body: UserCreateInput) =>
    api<UserDetailResponse>(API_ROUTES.USERS.BASE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  update: (id: string, body: UserUpdateBody) =>
    api<UserDetailResponse>(API_ROUTES.USERS.BY_ID(id), {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    }),

  delete: (id: string) =>
    api<null>(API_ROUTES.USERS.BY_ID(id), { method: 'DELETE' }),

  getUserInbox: (userId: string) =>
    api<InboxResult>(API_ROUTES.NOTIFICATIONS.ADMIN(userId)).then(r => r.data),

  getStudentTransactions: (studentId: string) =>
    api<CoinTransactionResponse[]>(
      `${API_ROUTES.BANK.ADMIN_TXS}?studentId=${studentId}`,
    ).then(r => r.data),
}
