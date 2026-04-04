import { Logger } from '@nestjs/common'
import {
  WebSocketGateway, WebSocketServer,
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets'
import { JwtService } from '@nestjs/jwt'
import { Server, Socket } from 'socket.io'
import { SocketService }  from './socket.service'
import type { SessionPayload } from '../../modules/auth/domain/user.entity'

@WebSocketGateway({
  path:       '/socket.io',
  cors:       { origin: process.env.WEB_ORIGIN ?? 'http://localhost:3001', credentials: true },
  transports: ['websocket', 'polling'],
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private readonly server!: Server
  private readonly logger = new Logger(AppGateway.name)

  constructor(
    private readonly socket: SocketService,
    private readonly jwt:    JwtService,
  ) {}

  afterInit(server: Server): void {
    this.socket.registerServer(server)
    this.logger.log('WebSocket gateway ready')
  }

  handleConnection(client: Socket): void {
    const payload = this.#validate(client)
    if (!payload) { client.disconnect(); return }

    if (payload.role === 'admin') {
      client.join('admin')
      this.logger.debug(`admin connected: ${payload.userId}`)
    } else if (payload.role === 'student' && payload.studentId) {
      client.join(`student:${payload.studentId}`)
      this.logger.debug(`student connected: ${payload.studentId}`)
    } else {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`disconnected: ${client.id}`)
  }

  #validate(client: Socket): SessionPayload | null {
    try {
      const cookie = client.handshake.headers.cookie ?? ''
      const match  = cookie.match(/(?:^|;\s*)cbt_session=([^;]+)/)
      const token  = match?.[1]
      return token ? this.jwt.verify<SessionPayload>(token) : null
    } catch { return null }
  }
}
