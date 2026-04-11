import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { CommandBus }     from '@nestjs/cqrs'
import { JwtAuthGuard }   from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }     from '../../../common/guards/roles.guard'
import { Roles }          from '../../../common/decorators/roles.decorator'
import { ResponseMessage } from '../../../common/decorators/response-message.decorator'
import { ROLES }          from '../../../common/constants'
import { AwardCoinsCommand } from '../application/commands/award-coins.command'
import { AwardCoinsDto }     from '../application/commands/award-coins.dto'

@Controller('puntos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
export class PointController {
  constructor(private readonly cb: CommandBus) {}

  @Post()
  @HttpCode(201)
  @ResponseMessage('Monedas otorgadas')
  award(@Body() dto: AwardCoinsDto) {
    return this.cb.execute(new AwardCoinsCommand(dto))
  }
}
