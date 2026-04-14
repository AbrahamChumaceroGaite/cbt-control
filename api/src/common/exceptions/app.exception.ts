import { HttpException, HttpStatus } from '@nestjs/common'
import { ErrorCode, ERROR_MESSAGES } from '@control-aula/shared'

export class AppException extends HttpException {
  constructor(code: ErrorCode, status = HttpStatus.BAD_REQUEST) {
    super(ERROR_MESSAGES[code], status)
  }
}
