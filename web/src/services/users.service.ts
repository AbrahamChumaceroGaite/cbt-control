import { apiFetch } from '@/lib/api'
import type { UserDetailResponse, UserCreateInput } from '@control-aula/shared'

export type { UserDetailResponse as UserFull }

type UserUpdateBody = { fullName?: string; isActive?: boolean; password?: string }

export const usersService = {
  getAll: () =>
    apiFetch<UserDetailResponse[]>('/api/usuarios'),

  create: (body: UserCreateInput) =>
    apiFetch<UserDetailResponse>('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  update: (id: string, body: UserUpdateBody) =>
    apiFetch<UserDetailResponse>(`/api/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<null>(`/api/usuarios/${id}`, { method: 'DELETE' }),
}
