import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { CommandBus }        from '@nestjs/cqrs'
import { JwtAuthGuard }      from '../../common/guards/jwt-auth.guard'
import { CurrentUser }       from '../../common/decorators/current-user.decorator'
import { ResponseMessage }   from '../../common/decorators/response-message.decorator'
import type { SessionPayload } from '../auth/domain/user.entity'
import { PushSenderService } from './infrastructure/push-sender.service'
import { SubscribeCommand, SubscribeDto }   from './application/commands/subscribe.command'
import { UnsubscribeCommand, UnsubscribeDto } from './application/commands/unsubscribe.command'

@Controller('push')
export class PushController {
  constructor(
    private readonly cb:     CommandBus,
    private readonly sender: PushSenderService,
  ) {}

  /** Public — returns the VAPID public key needed by the browser to subscribe. */
  @Get('vapid-key')
  getVapidKey() {
    return { publicKey: this.sender.publicKey }
  }

  @Post('subscribe')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Suscripción registrada')
  subscribe(@CurrentUser() user: SessionPayload, @Body() dto: SubscribeDto) {
    return this.cb.execute(new SubscribeCommand(user.userId, dto))
  }

  @Post('unsubscribe')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Suscripción eliminada')
  unsubscribe(@Body() dto: UnsubscribeDto) {
    return this.cb.execute(new UnsubscribeCommand(dto.endpoint))
  }
}
