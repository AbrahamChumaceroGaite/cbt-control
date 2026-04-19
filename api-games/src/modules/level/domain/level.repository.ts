import type { LevelEntity } from './level.entity'

export const LEVEL_REPOSITORY = 'LEVEL_REPOSITORY'

export interface LevelRepository {
  findByGame(gameId: string):                      Promise<LevelEntity[]>
  findByNumber(gameId: string, number: number):    Promise<LevelEntity | null>
}
