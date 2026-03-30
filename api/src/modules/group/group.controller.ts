import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }  from '@nestjs/cqrs'
import { JwtAuthGuard }          from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }       from '../../common/decorators/response-message.decorator'
import { GetGroupsQuery }        from './application/queries/get-groups.query'
import { CreateGroupCommand, CreateGroupDto } from './application/commands/create-group.command'
import { UpdateGroupCommand, UpdateGroupDto } from './application/commands/update-group.command'
import { DeleteGroupCommand }    from './application/commands/delete-group.command'

@Controller('grupos')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getAll(@Query('courseId') courseId?: string) {
    return this.qb.execute(new GetGroupsQuery(courseId))
  }

  @Post()
  @HttpCode(201)
  @ResponseMessage('Grupo creado')
  create(@Body() dto: CreateGroupDto) {
    return this.cb.execute(new CreateGroupCommand(dto))
  }

  @Put(':id')
  @ResponseMessage('Grupo actualizado')
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.cb.execute(new UpdateGroupCommand(id, dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Grupo eliminado')
  async delete(@Param('id') id: string) {
    await this.cb.execute(new DeleteGroupCommand(id))
  }
}
