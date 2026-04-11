import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard }         from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }           from '../../../common/guards/roles.guard'
import { Roles }                from '../../../common/decorators/roles.decorator'
import { ResponseMessage }      from '../../../common/decorators/response-message.decorator'
import { ROLES }                from '../../../common/constants'
import { GetActionsQuery }      from '../application/queries/get-actions.query'
import { CreateActionCommand }  from '../application/commands/create-action.command'
import { CreateActionDto }      from '../application/commands/create-action.dto'
import { UpdateActionCommand }  from '../application/commands/update-action.command'
import { UpdateActionDto }      from '../application/commands/update-action.dto'
import { DeleteActionCommand }  from '../application/commands/delete-action.command'

@Controller('acciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getAll() {
    return this.qb.execute(new GetActionsQuery())
  }

  @Post()
  @HttpCode(201)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Acción creada')
  create(@Body() dto: CreateActionDto) {
    return this.cb.execute(new CreateActionCommand(dto))
  }

  @Put(':id')
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Acción actualizada')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateActionDto) {
    return this.cb.execute(new UpdateActionCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Acción eliminada')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.cb.execute(new DeleteActionCommand(id))
  }
}
