import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector }         from '@nestjs/core'
import { Observable }        from 'rxjs'
import { map }               from 'rxjs/operators'
import type { Response }     from 'express'
import type { IApiResponse } from '@control-aula/shared'
import { RESPONSE_MESSAGE }  from '../decorators/response-message.decorator'

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IApiResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<IApiResponse<T>> {
    const res     = ctx.switchToHttp().getResponse<Response>()
    const message = this.reflector.get<string>(RESPONSE_MESSAGE, ctx.getHandler()) ?? 'OK'

    return next.handle().pipe(
      map(data => ({
        code:   res.statusCode,
        status: 'success' as const,
        data:   data ?? null,
        message,
      })),
    )
  }
}
