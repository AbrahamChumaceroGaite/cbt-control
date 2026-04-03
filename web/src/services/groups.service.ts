import { apiFetch, apiFetchFull } from '@/lib/api'
import type { GroupResponse, GroupInput } from '@control-aula/shared'

export const groupsService = {
  getByCourse: (courseId: string) =>
    apiFetch<GroupResponse[]>(`/api/grupos?courseId=${courseId}`),

  create: (body: GroupInput & { courseId: string }) =>
    apiFetchFull<GroupResponse>('/api/grupos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  update: (id: string, body: GroupInput) =>
    apiFetchFull<GroupResponse>(`/api/grupos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetchFull<null>(`/api/grupos/${id}`, { method: 'DELETE' }),
}
