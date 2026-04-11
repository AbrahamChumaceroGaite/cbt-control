import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus }  from '@nestjs/cqrs'
import { JwtAuthGuard }          from '../../../common/guards/jwt-auth.guard'
import { RolesGuard }            from '../../../common/guards/roles.guard'
import { Roles }                 from '../../../common/decorators/roles.decorator'
import { ResponseMessage }       from '../../../common/decorators/response-message.decorator'
import { ROLES }                 from '../../../common/constants'
import { UserRepository }        from '../domain/user.repository'
import { GetUsersQuery }         from '../application/queries/get-users.query'
import { CreateUserCommand }     from '../application/commands/create-user.command'
import { CreateUserDto }         from '../application/commands/create-user.dto'
import { UpdateUserDto }         from '../application/commands/update-user.dto'

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROLES.ADMIN)
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
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    const data: Parameters<UserRepository['update']>[1] = {}
    if (dto.fullName !== undefined) data.fullName = dto.fullName
    if (dto.isActive !== undefined) data.isActive = dto.isActive
    if (dto.password) {
      const bcrypt = await import('bcryptjs')
      data.passwordHash = await bcrypt.hash(dto.password, 10)
    }
    return this.repo.update(id, data)
  }

  @Delete(':id')
  @HttpCode(200)
  @ResponseMessage('Usuario eliminado')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.repo.delete(id)
  }
}
