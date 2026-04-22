import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { GameResponse, LevelResponse, GameUpdateInput } from '@control-aula/shared'

interface LevelCompleteResult {
  coinsEarned:    number
  newBalance:     number
  alreadyApplied: boolean
}

interface ContinueResult {
  coinsSpent: number
  newBalance: number
}

interface UploadUrlResult {
  uploadUrl:  string
  publicUrl:  string
  objectName: string
}

export const gamesService = {
  getAll: () =>
    api<GameResponse[]>(API_ROUTES.GAMES.BASE).then(r => r.data),

  getBySlug: (slug: string) =>
    api<GameResponse>(API_ROUTES.GAMES.BY_SLUG(slug)).then(r => r.data),

  getLevels: (gameId: string) =>
    api<LevelResponse[]>(API_ROUTES.GAMES.LEVELS(gameId)).then(r => r.data),

  update: (id: string, dto: GameUpdateInput) =>
    api<GameResponse>(API_ROUTES.GAMES.UPDATE(id), {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(dto),
    }).then(r => r.data),

  /** Step 1 of asset upload: get a presigned PUT URL from api-games. */
  getUploadUrl: (gameId: string, filename: string, fileType: 'game' | 'bios' | 'cover') =>
    api<UploadUrlResult>(API_ROUTES.GAMES.UPLOAD_URL(gameId), {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ filename, fileType }),
    }).then(r => r.data),

  /**
   * Step 2 of asset upload: PUT the file directly to MinIO.
   * Returns when MinIO confirms the upload (no API server involved).
   */
  uploadToStorage: async (uploadUrl: string, file: File): Promise<void> => {
    const res = await fetch(uploadUrl, { method: 'PUT', body: file })
    if (!res.ok) throw new Error(`Storage upload failed: ${res.status}`)
  },

  completeLevel: (gameSlug: string, levelNumber: number, score: number, idempotencyKey: string) =>
    api<LevelCompleteResult>(API_ROUTES.GAMES.LEVEL_COMPLETE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ gameSlug, levelNumber, score, idempotencyKey }),
    }).then(r => r.data),

  useContinue: (gameSlug: string, idempotencyKey: string) =>
    api<ContinueResult>(API_ROUTES.GAMES.CONTINUE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ gameSlug, idempotencyKey }),
    }).then(r => r.data),
}
