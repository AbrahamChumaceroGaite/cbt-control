import { IQueryHandler, QueryHandler }        from '@nestjs/cqrs'
import { Inject }                              from '@nestjs/common'
import { GetLevelsQuery }                      from './get-levels.query'
import { LEVEL_REPOSITORY }                    from '../../domain/level.repository'
import type { LevelRepository }                from '../../domain/level.repository'
import { LevelMapper }                         from '../level.mapper'
import type { LevelResponse }                  from '@control-aula/shared'

@QueryHandler(GetLevelsQuery)
export class GetLevelsHandler implements IQueryHandler<GetLevelsQuery, LevelResponse[]> {
  constructor(
    @Inject(LEVEL_REPOSITORY) private readonly repo: LevelRepository,
  ) {}

  async execute({ gameId }: GetLevelsQuery): Promise<LevelResponse[]> {
    const entities = await this.repo.findByGame(gameId)
    return entities.map(LevelMapper.toResponse)
  }
}
