import { Body, Controller, Delete, Get, HttpCode, Param, Patch, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }    from '@nestjs/cqrs'
import { JwtAuthGuard }            from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }              from '../../../common/guards/roles.guard'
import { Roles }                   from '../../../common/decorators/roles.decorator'
import { CurrentUser }             from '../../../common/decorators/current-user.decorator'
import { ResponseMessage }         from '../../../common/decorators/response-message.decorator'
import { ROLES }                   from '../../../common/constants'
import type { SessionPayload }     from '../../auth/domain/user.entity'
import { GetInboxQuery }           from '../application/queries/get-inbox.query'
import { MarkReadCommand }         from '../application/commands/mark-read.command'
import { BatchInboxCommand }       from '../application/commands/batch-inbox.command'
import { BatchInboxDto }           from '../application/commands/batch-inbox.dto'

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class InboxController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getInbox(@CurrentUser() user: SessionPayload) {
    return this.qb.execute(new GetInboxQuery(user.userId))
  }

  @Patch('batch')
  @HttpCode(200)
  @ResponseMessage('Operación completada')
  batch(@CurrentUser() user: SessionPayload, @Body() dto: BatchInboxDto) {
    return this.cb.execute(new BatchInboxCommand(user.userId, dto))
  }

  @Patch(':id/read')
  @HttpCode(200)
  @ResponseMessage('Notificación marcada como leída')
  markRead(@CurrentUser() user: SessionPayload, @Param('id') id: string) {
    return this.cb.execute(new MarkReadCommand(id, user.userId))
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Notificación eliminada')
  deleteOne(@CurrentUser() user: SessionPayload, @Param('id') id: string) {
    return this.cb.execute(new BatchInboxCommand(user.userId, { action: 'delete-many', ids: [id] }))
  }

  /** Admin: view any user's notification inbox */
  @Get('admin/users/:userId')
  @UseGuards(RolesGuard)
  @Roles(ROLES.ADMIN)
  adminUserInbox(@Param('userId') userId: string) {
    return this.qb.execute(new GetInboxQuery(userId))
  }
}
