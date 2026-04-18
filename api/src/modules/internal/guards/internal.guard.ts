import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request }  from 'express'

/**
 * Validates the X-Internal-Secret header on service-to-service calls.
 * Never uses JWT — this guard is exclusively for internal API routes.
 */
@Injectable()
export class InternalGuard implements CanActivate {
  private readonly secret: string

  constructor(private readonly config: ConfigService) {
    this.secret = config.get<string>('INTERNAL_SECRET') ?? ''
  }

  canActivate(ctx: ExecutionContext): boolean {
    const req    = ctx.switchToHttp().getRequest<Request>()
    const header = req.headers['x-internal-secret']

    if (!this.secret) throw new UnauthorizedException('INTERNAL_SECRET not configured')
    if (header !== this.secret) throw new UnauthorizedException('Invalid internal secret')

    return true
  }
}
