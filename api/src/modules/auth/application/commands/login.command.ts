import { ICommandHandler, CommandHandler } from '@nestjs/cqrs'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { UnauthorizedException }            from '@nestjs/common'
import { JwtService }                       from '@nestjs/jwt'
import * as bcrypt                          from 'bcryptjs'
import { UserRepository }                   from '../../domain/user.repository'
import type { SessionPayload }              from '../../domain/user.entity'

export class LoginDto {
  @IsString() @IsNotEmpty() code!:     string
  @IsOptional() @IsString() password?: string
}

export class LoginCommand {
  constructor(public readonly dto: LoginDto) {}
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, { token: string; user: SessionPayload }> {
  constructor(
    private readonly repo: UserRepository,
    private readonly jwt:  JwtService,
  ) {}

  async execute({ dto }: LoginCommand): Promise<{ token: string; user: SessionPayload }> {
    const user = await this.repo.findByCode(dto.code)
    if (!user || !user.isActive) throw new UnauthorizedException('Credenciales inválidas')

    // Students log in with only their code (seed sets password = code).
    // Admins must supply an explicit password.
    const attempt = dto.password ?? dto.code
    const valid   = await bcrypt.compare(attempt, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Credenciales inválidas')

    const payload: SessionPayload = {
      userId:    user.id,
      role:      user.role,
      studentId: user.studentId ?? undefined,
      code:      user.code,
      fullName:  user.fullName,
    }

    const token = this.jwt.sign(payload)
    return { token, user: payload }
  }
}
