import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { CommandBus }     from '@nestjs/cqrs'
import { JwtAuthGuard }   from '../../common/guards/jwt-auth.guard'
import { ResponseMessage } from '../../common/decorators/response-message.decorator'
import { AwardCoinsCommand, AwardCoinsDto } from './application/commands/award-coins.command'

@Controller('puntos')
@UseGuards(JwtAuthGuard)
export class PointController {
  constructor(private readonly cb: CommandBus) {}

  @Post()
  @HttpCode(201)
  @ResponseMessage('Monedas otorgadas')
  award(@Body() dto: AwardCoinsDto) {
    return this.cb.execute(new AwardCoinsCommand(dto))
  }
}
