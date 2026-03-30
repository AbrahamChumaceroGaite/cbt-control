import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Prisma } from '@prisma/client'
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

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaKnown(exception)
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return [HttpStatus.BAD_REQUEST, 'Datos inválidos']
    }

    return [HttpStatus.INTERNAL_SERVER_ERROR, 'Error interno del servidor']
  }

  private mapPrismaKnown(e: Prisma.PrismaClientKnownRequestError): [number, string] {
    switch (e.code) {
      case 'P2002': return [HttpStatus.CONFLICT,   'Ya existe un registro con ese valor']
      case 'P2025': return [HttpStatus.NOT_FOUND,  'Registro no encontrado']
      case 'P2003': return [HttpStatus.CONFLICT,   'No se puede eliminar: tiene registros asociados']
      case 'P2014': return [HttpStatus.CONFLICT,   'Violación de relación entre registros']
      case 'P2016': return [HttpStatus.NOT_FOUND,  'Registro no encontrado']
      default:      return [HttpStatus.BAD_REQUEST, 'Error al procesar la operación']
    }
  }
}
