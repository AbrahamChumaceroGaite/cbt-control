import { apiFetch } from '@/lib/api'

export type RestoreDetail = { created: number; updated?: number }

export type RestoreResult = {
  detected: string[]
  details: {
    courses?:    RestoreDetail
    students?:   RestoreDetail
    groups?:     RestoreDetail
    actions?:    RestoreDetail
    rewards?:    RestoreDetail
    coinLogs?:   RestoreDetail
    solicitudes?: RestoreDetail
  }
}

export const backupService = {
  download: (sections: string[]) =>
    fetch(`/api/backup?sections=${sections.join(',')}`),

  restore: (data: unknown) =>
    apiFetch<RestoreResult>('/api/backup/restore', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }),
}
