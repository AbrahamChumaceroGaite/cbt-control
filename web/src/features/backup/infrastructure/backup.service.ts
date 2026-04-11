import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { RestoreResult } from '../domain/types'

export const backupService = {
  /** Returns the raw Response so the caller can stream the blob. */
  download: (sections: string[]): Promise<Response> =>
    fetch(`${API_ROUTES.BACKUP.DOWNLOAD}?sections=${sections.join(',')}`),

  restore: (data: unknown) =>
    api<RestoreResult>(API_ROUTES.BACKUP.RESTORE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    }).then(r => r.data),
}
