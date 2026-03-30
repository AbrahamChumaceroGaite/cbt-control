import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { SessionPayload } from '../../modules/auth/domain/user.entity'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionPayload =>
    ctx.switchToHttp().getRequest()['user'],
)
