import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }  from '@nestjs/cqrs'
import type { Response }         from 'express'
import { JwtAuthGuard }          from '../../../common/guards/jwt-auth.guard'
import { ResponseMessage }       from '../../../common/decorators/response-message.decorator'
import { CurrentUser }           from '../../../common/decorators/current-user.decorator'
import { COOKIE_NAME, COOKIE_OPTS } from '../../../common/constants'
import type { SessionPayload }   from '../domain/user.entity'
import { LoginCommand }          from '../application/commands/login.command'
import { LoginDto }              from '../application/commands/login.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly qb: QueryBus,
    private readonly cb: CommandBus,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ResponseMessage('Bienvenido')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.cb.execute(new LoginCommand(dto))
    res.cookie(COOKIE_NAME, result.token, COOKIE_OPTS)
    return { user: result.user }
  }

  @Post('logout')
  @HttpCode(200)
  @ResponseMessage('Sesión cerrada')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, { path: '/' })
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: SessionPayload) {
    return user
  }
}
