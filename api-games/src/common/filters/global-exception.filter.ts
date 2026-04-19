import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import type { Response } from 'express'
import type { IApiResponse } from '@control-aula/shared'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()

    const [status, message] = this.resolve(exception)
    const body: IApiResponse<null> = { code: status, status: 'error', data: null, message }
    res.status(status).json(body)
  }

  private resolve(exception: unknown): [number, string] {
    if (exception instanceof HttpException) {
      const status  = exception.getStatus()
      const payload = exception.getResponse()
      const message = typeof payload === 'object' && payload !== null && 'message' in payload
        ? (payload as { message: string | string[] }).message
        : exception.message
      return [status, Array.isArray(message) ? message.join(', ') : message]
    }

    if (exception instanceof Error) {
      console.error('[api-games] Unhandled error:', exception.message)
    }

    return [HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error']
  }
}
