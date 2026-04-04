import { Logger } from '@nestjs/common'
import {
  WebSocketGateway, WebSocketServer,
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets'
import { JwtService } from '@nestjs/jwt'
import { Server, Socket } from 'socket.io'
import { SocketService } from './socket.service'
import type { SessionPayload } from '../../modules/auth/domain/user.entity'

@WebSocketGateway({
  // /socket.io está fuera del prefijo global /api → Express no lo intercepta
  path:       '/socket.io',
  cors:       { origin: '*', credentials: false },
  transports: ['polling'],
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private server!: Server
  private readonly logger = new Logger(AppGateway.name)

  constructor(
    private readonly socket: SocketService,
    private readonly jwt:    JwtService,
  ) {}

  afterInit(server: Server): void {
    this.socket.registerServer(server)
  }

  handleConnection(client: Socket): void {
    const payload = this.#validate(client)
    if (!payload) { client.disconnect(); return }

    if (payload.role === 'admin') {
      client.join('admin')
      this.logger.debug(`admin:${payload.userId} connected`)
    } else if (payload.role === 'student' && payload.studentId) {
      client.join(`student:${payload.studentId}`)
      this.logger.debug(`student:${payload.studentId} connected`)
    } else {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`disconnected:${client.id}`)
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
