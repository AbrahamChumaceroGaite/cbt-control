import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets'
import { JwtService } from '@nestjs/jwt'
import { WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { SocketService } from './socket.service'
import type { SessionPayload } from '../../modules/auth/domain/user.entity'

@WebSocketGateway({ path: '/ws' })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly sockets: SocketService,
    private readonly jwt:     JwtService,
  ) {}

  handleConnection(client: WebSocket, req: IncomingMessage): void {
    const session = this.#auth(req)
    if (!session) { client.close(1008, 'Unauthorized'); return }

    if (session.role === 'admin') {
      this.sockets.register('admin', session.userId, client)
    } else if (session.role === 'student' && session.studentId) {
      this.sockets.register('student', session.studentId, client)
    } else {
      client.close(1008, 'Forbidden')
    }
  }

  handleDisconnect(client: WebSocket): void {
    this.sockets.unregister(client)
  }

  #auth(req: IncomingMessage): SessionPayload | null {
    try {
      const cookie = req.headers.cookie ?? ''
      const match  = cookie.match(/(?:^|;\s*)cbt_session=([^;]+)/)
      const token  = match?.[1]
      return token ? this.jwt.verify<SessionPayload>(token) : null
    } catch { return null }
  }
}
