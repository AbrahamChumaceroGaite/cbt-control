import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Request } from 'express'
import type { SessionPayload } from '../../modules/auth/domain/user.entity'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>()

    const cookie = (req.cookies as Record<string, string>)?.['cbt_session']
    const header = req.headers.authorization?.replace('Bearer ', '')
    const token  = cookie ?? header

    if (!token) throw new UnauthorizedException('No autenticado')

    try {
      (req as Request & { user: SessionPayload })['user'] = this.jwt.verify<SessionPayload>(token)
      return true
    } catch {
      throw new UnauthorizedException('Token inválido o expirado')
    }
  }
}
