import { api }        from '@/lib/api'
import { API_ROUTES } from '@/config/routes'
import type { GameResponse, LevelResponse, GameUpdateInput } from '@control-aula/shared'

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
}
