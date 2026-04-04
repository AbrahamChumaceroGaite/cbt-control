import { Controller, Get, Header, UseGuards } from '@nestjs/common'
import { Sse, MessageEvent }                  from '@nestjs/common'
import { Observable, EMPTY }                  from 'rxjs'
import { JwtAuthGuard }    from '../../common/guards/jwt-auth.guard'
import { CurrentUser }     from '../../common/decorators/current-user.decorator'
import { SocketService }   from './socket.service'
import type { SessionPayload } from '../../modules/auth/domain/user.entity'

@Controller('events')
@UseGuards(JwtAuthGuard)
export class SseController {
  constructor(private readonly sockets: SocketService) {}

  @Get()
  @Sse()
  @Header('Cache-Control', 'no-cache')
  @Header('X-Accel-Buffering', 'no')
  stream(@CurrentUser() user: SessionPayload): Observable<MessageEvent> {
    if (user.role === 'admin')
      return this.sockets.subscribeAdmin(user.userId)
    if (user.role === 'student' && user.studentId)
      return this.sockets.subscribeStudent(user.studentId)
    return EMPTY
  }
}
