import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { GameResponse, LevelResponse } from '@control-aula/shared'

export const gamesService = {
  getAll: () =>
    api<GameResponse[]>(API_ROUTES.GAMES.BASE).then(r => r.data),

  getBySlug: (slug: string) =>
    api<GameResponse>(API_ROUTES.GAMES.BY_SLUG(slug)).then(r => r.data),

  getLevels: (gameId: string) =>
    api<LevelResponse[]>(API_ROUTES.GAMES.LEVELS(gameId)).then(r => r.data),
}
