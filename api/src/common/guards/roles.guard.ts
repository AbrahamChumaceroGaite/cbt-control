import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import type { SessionPayload } from '../../modules/auth/domain/user.entity'
import type { Request } from 'express'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    // No @Roles() decorator → any authenticated user passes
    if (!required || required.length === 0) return true

    const req  = ctx.switchToHttp().getRequest<Request & { user: SessionPayload }>()
    const user = req.user
    return required.includes(user?.role)
  }
}
