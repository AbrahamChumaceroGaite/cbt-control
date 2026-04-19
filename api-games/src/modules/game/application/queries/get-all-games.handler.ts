import { IQueryHandler, QueryHandler }     from '@nestjs/cqrs'
import { Inject }                          from '@nestjs/common'
import { GetAllGamesQuery }                from './get-all-games.query'
import { GAME_REPOSITORY }                 from '../../domain/game.repository'
import type { GameRepository }             from '../../domain/game.repository'
import { GameMapper }                      from '../game.mapper'
import type { GameResponse }               from '@control-aula/shared'

@QueryHandler(GetAllGamesQuery)
export class GetAllGamesHandler implements IQueryHandler<GetAllGamesQuery, GameResponse[]> {
  constructor(
    @Inject(GAME_REPOSITORY) private readonly repo: GameRepository,
  ) {}

  async execute(): Promise<GameResponse[]> {
    const entities = await this.repo.findAll()
    return entities.map(GameMapper.toResponse)
  }
}
