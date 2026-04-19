import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }    from '@nestjs/cqrs'
import { JwtAuthGuard }            from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }              from '../../../common/guards/roles.guard'
import { Roles }                   from '../../../common/decorators/roles.decorator'
import { ROLES }                   from '../../../common/constants/roles'
import { CreateGameCommand }       from '../application/commands/create-game.command'
import { UpdateGameCommand }       from '../application/commands/update-game.command'
import { GetAllGamesQuery }        from '../application/queries/get-all-games.query'
import { GetGameBySlugQuery }      from '../application/queries/get-game-by-slug.query'
import { CreateGameDto }           from '../application/dtos/create-game.dto'
import { UpdateGameDto }           from '../application/dtos/update-game.dto'

@Controller('games')
export class GameController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus:   QueryBus,
  ) {}

  /** Public — game library for the games menu */
  @Get()
  getAll() {
    return this.queryBus.execute(new GetAllGamesQuery())
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.queryBus.execute(new GetGameBySlugQuery(slug))
  }

  /** Admin only — game catalogue management */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Post()
  create(@Body() dto: CreateGameDto) {
    return this.commandBus.execute(new CreateGameCommand(dto))
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGameDto) {
    return this.commandBus.execute(new UpdateGameCommand(id, dto))
  }
}
