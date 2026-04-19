import { IQueryHandler, QueryHandler }     from '@nestjs/cqrs'
import { Inject, NotFoundException }       from '@nestjs/common'
import { GetGameBySlugQuery }              from './get-game-by-slug.query'
import { GAME_REPOSITORY }                 from '../../domain/game.repository'
import type { GameRepository }             from '../../domain/game.repository'
import { GameMapper }                      from '../game.mapper'
import type { GameResponse }               from '@control-aula/shared'

@QueryHandler(GetGameBySlugQuery)
export class GetGameBySlugHandler implements IQueryHandler<GetGameBySlugQuery, GameResponse> {
  constructor(
    @Inject(GAME_REPOSITORY) private readonly repo: GameRepository,
  ) {}

  async execute({ slug }: GetGameBySlugQuery): Promise<GameResponse> {
    const entity = await this.repo.findBySlug(slug)
    if (!entity) throw new NotFoundException(`Game '${slug}' not found`)
    return GameMapper.toResponse(entity)
  }
}
