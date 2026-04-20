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
