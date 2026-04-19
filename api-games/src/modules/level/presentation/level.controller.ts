import { Controller, Get, Param } from '@nestjs/common'
import { QueryBus }               from '@nestjs/cqrs'
import { GetLevelsQuery }         from '../application/queries/get-levels.query'

@Controller('games/:gameId/levels')
export class LevelController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  getLevels(@Param('gameId') gameId: string) {
    return this.queryBus.execute(new GetLevelsQuery(gameId))
  }
}
