import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }  from '@nestjs/cqrs'
import { JwtAuthGuard }          from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }       from '../../common/decorators/response-message.decorator'
import { GetActionsQuery }       from './application/queries/get-actions.query'
import { CreateActionCommand, CreateActionDto } from './application/commands/create-action.command'
import { UpdateActionCommand, UpdateActionDto } from './application/commands/update-action.command'
import { DeleteActionCommand }   from './application/commands/delete-action.command'

@Controller('acciones')
@UseGuards(JwtAuthGuard)
export class ActionController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getAll() {
    return this.qb.execute(new GetActionsQuery())
  }

  @Post()
  @HttpCode(201)
  @ResponseMessage('Acción creada')
  create(@Body() dto: CreateActionDto) {
    return this.cb.execute(new CreateActionCommand(dto))
  }

  @Put(':id')
  @ResponseMessage('Acción actualizada')
  update(@Param('id') id: string, @Body() dto: UpdateActionDto) {
    return this.cb.execute(new UpdateActionCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Acción eliminada')
  async delete(@Param('id') id: string) {
    await this.cb.execute(new DeleteActionCommand(id))
  }
}
