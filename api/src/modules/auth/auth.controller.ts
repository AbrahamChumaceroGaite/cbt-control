import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Res, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }   from '@nestjs/cqrs'
import { JwtService }             from '@nestjs/jwt'
import type { Response }          from 'express'
import { JwtAuthGuard }           from '../../common/guards/jwt-auth.guard'
import { ResponseMessage }        from '../../common/decorators/response-message.decorator'
import { CurrentUser }            from '../../common/decorators/current-user.decorator'
import type { SessionPayload }    from './domain/user.entity'
import { LoginCommand, LoginDto } from './application/commands/login.command'
import { CreateUserCommand, CreateUserDto } from './application/commands/create-user.command'
import { GetUsersQuery }          from './application/queries/get-users.query'
import { UserRepository }         from './domain/user.repository'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

const COOKIE_NAME = 'cbt_session'
const COOKIE_OPTS = { httpOnly: true, path: '/', sameSite: 'lax' as const, maxAge: 8 * 60 * 60 * 1000 }

/** DTO for partial user updates (name, password, active status) */
class UpdateUserDto {
  @IsOptional() @IsString()  fullName?: string
  @IsOptional() @IsString()  password?: string
  @IsOptional() @IsBoolean() isActive?: boolean
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly qb:  QueryBus,
    private readonly cb:  CommandBus,
    private readonly jwt: JwtService,
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

  /** Issues a short-lived token (60 s) for the WebSocket handshake.
   *  The cookie is httpOnly so the client can't read it directly. */
  @Get('ws-token')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Token WS generado')
  wsToken(@CurrentUser() user: SessionPayload) {
    const token = this.jwt.sign(user, { expiresIn: '60s' })
    return { token }
  }
}

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly qb:   QueryBus,
    private readonly cb:   CommandBus,
    private readonly repo: UserRepository,
  ) {}

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

  @Patch(':id')
  @ResponseMessage('Usuario actualizado')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data: Parameters<UserRepository['update']>[1] = {}
    if (dto.fullName !== undefined) data.fullName  = dto.fullName
    if (dto.isActive !== undefined) data.isActive  = dto.isActive
    if (dto.password) {
      const bcrypt = await import('bcryptjs')
      data.passwordHash = await bcrypt.hash(dto.password, 10)
    }
    return this.repo.update(id, data)
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Usuario eliminado')
  async delete(@Param('id') id: string) {
    await this.repo.delete(id)
  }
}
