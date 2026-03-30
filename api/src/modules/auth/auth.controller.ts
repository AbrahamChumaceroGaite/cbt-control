import { Body, Controller, Delete, Get, HttpCode, Param, Post, Res, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }   from '@nestjs/cqrs'
import type { Response }          from 'express'
import { JwtAuthGuard }           from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }        from '../../common/decorators/response-message.decorator'
import { CurrentUser }            from '../../common/decorators/current-user.decorator'
import type { SessionPayload }    from './domain/user.entity'
import { LoginCommand, LoginDto } from './application/commands/login.command'
import { CreateUserCommand, CreateUserDto } from './application/commands/create-user.command'
import { GetUsersQuery }          from './application/queries/get-users.query'

const COOKIE_NAME = 'cbt_session'
const COOKIE_OPTS = { httpOnly: true, path: '/', sameSite: 'lax' as const, maxAge: 8 * 60 * 60 * 1000 }

@Controller('auth')
export class AuthController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

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

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly qb: QueryBus, private readonly cb: CommandBus) {}

  @Get()
  getAll() {
    return this.qb.execute(new GetUsersQuery())
  }

  @Post()
  @HttpCode(201)
  @ResponseMessage('Usuario creado')
  create(@Body() dto: CreateUserDto) {
    return this.cb.execute(new CreateUserCommand(dto))
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Usuario eliminado')
  async delete(@Param('id') id: string) {
    // TODO: add DeleteUserCommand if needed
  }
}
