import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard }         from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }           from '../../../common/guards/roles.guard'
import { Roles }                from '../../../common/decorators/roles.decorator'
import { ResponseMessage }      from '../../../common/decorators/response-message.decorator'
import { ROLES }                from '../../../common/constants'
import { GetGroupsQuery }       from '../application/queries/get-groups.query'
import { CreateGroupCommand }   from '../application/commands/create-group.command'
import { CreateGroupDto }       from '../application/commands/create-group.dto'
import { UpdateGroupCommand }   from '../application/commands/update-group.command'
import { UpdateGroupDto }       from '../application/commands/update-group.dto'
import { DeleteGroupCommand }   from '../application/commands/delete-group.command'

@Controller('grupos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getAll(@Query('courseId') courseId?: string) {
    return this.qb.execute(new GetGroupsQuery(courseId))
  }

  @Post()
  @HttpCode(201)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Grupo creado')
  create(@Body() dto: CreateGroupDto) {
    return this.cb.execute(new CreateGroupCommand(dto))
  }

  @Put(':id')
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Grupo actualizado')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGroupDto) {
    return this.cb.execute(new UpdateGroupCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @Roles(ROLES.ADMIN)
  @ResponseMessage('Grupo eliminado')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.cb.execute(new DeleteGroupCommand(id))
  }
}
