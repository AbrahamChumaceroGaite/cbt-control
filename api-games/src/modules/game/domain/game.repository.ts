import type { GameEntity } from './game.entity'

export const GAME_REPOSITORY = 'GAME_REPOSITORY'

export interface GameRepository {
  findAll():               Promise<GameEntity[]>
  findById(id: string):    Promise<GameEntity | null>
  findBySlug(slug: string): Promise<GameEntity | null>
  create(entity: GameEntity): Promise<GameEntity>
  update(entity: GameEntity): Promise<GameEntity>
  delete(id: string):      Promise<void>
}
