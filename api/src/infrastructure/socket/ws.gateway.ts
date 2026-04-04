import { Logger } from '@nestjs/common'
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets'
import { JwtService } from '@nestjs/jwt'
import { WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { SocketService } from './socket.service'
import type { SessionPayload } from '../../modules/auth/domain/user.entity'

@WebSocketGateway({ path: '/ws' })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WsGateway.name)

  constructor(
    private readonly sockets: SocketService,
    private readonly jwt:     JwtService,
  ) {}

  handleConnection(client: WebSocket, req: IncomingMessage): void {
    this.logger.log(`incoming connection  url=${req.url}  cookie=${req.headers.cookie ? 'present' : 'MISSING'}`)

    const session = this.#auth(req)
    if (!session) {
      this.logger.warn('rejected — token invalid or missing')
      client.close(1008, 'Unauthorized')
      return
    }

    if (session.role === 'admin') {
      this.sockets.register('admin', session.userId, client)
      this.logger.log(`admin joined  userId=${session.userId}`)
    } else if (session.role === 'student' && session.studentId) {
      this.sockets.register('student', session.studentId, client)
      this.logger.log(`student joined  studentId=${session.studentId}`)
    } else {
      this.logger.warn(`rejected — unrecognized role=${session.role}`)
      client.close(1008, 'Forbidden')
    }
  }

  handleDisconnect(client: WebSocket): void {
    this.sockets.unregister(client)
    this.logger.log('client disconnected')
  }

  #auth(req: IncomingMessage): SessionPayload | null {
    try {
      const cookie = req.headers.cookie ?? ''
      const match  = cookie.match(/(?:^|;\s*)cbt_session=([^;]+)/)
      const token  = match?.[1]
      if (!token) { this.logger.debug('no cbt_session cookie found'); return null }
      return this.jwt.verify<SessionPayload>(token)
    } catch (err: any) {
      this.logger.debug(`jwt verify failed: ${err?.message}`)
      return null
    }
  }
}
