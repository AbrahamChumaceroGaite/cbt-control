import { Logger } from '@nestjs/common'
import {
  WebSocketGateway, WebSocketServer,
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets'
import { JwtService }     from '@nestjs/jwt'
import { Server, Socket } from 'socket.io'
import { PrismaService }  from '../prisma/prisma.service'
import { SocketService }  from './socket.service'
import type { SessionPayload } from '../../modules/auth/domain/user.entity'

@WebSocketGateway({
  // Path under /api/ so Next.js rewrites (/api/:path* → api:4001/api/:path*)
  // forward socket.io polling requests to the API without needing a separate proxy.
  path: '/api/socket.io',
  cors: { origin: '*', credentials: false },
  transports: ['polling'],
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private server!: Server
  private readonly logger = new Logger(AppGateway.name)

  constructor(
    private readonly socket: SocketService,
    private readonly jwt:    JwtService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server): void {
    this.socket.registerServer(server)
  }

  async handleConnection(client: Socket): Promise<void> {
    const payload = this.#validate(client)
    if (!payload) { client.disconnect(); return }

    client.data['userId'] = payload.userId
    client.data['role']   = payload.role

    if (payload.role === 'admin') {
      client.join('admin')
      this.logger.debug(`admin:${payload.userId} connected`)
    } else if (payload.role === 'student' && payload.studentId) {
      client.join(`student:${payload.studentId}`)
      const student = await this.prisma.student.findUnique({
        where:  { id: payload.studentId },
        select: { courseId: true },
      })
      if (student?.courseId) client.join(`course:${student.courseId}`)
      this.logger.debug(`student:${payload.studentId} connected`)
    } else {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`disconnected:${client.data['userId']}`)
  }

  /** Reads the httpOnly session cookie from the socket handshake headers.
   *  The browser sends cookies automatically on WebSocket upgrade and XHR polling. */
  #validate(client: Socket): SessionPayload | null {
    try {
      const cookie = client.handshake.headers.cookie ?? ''
      const match  = cookie.match(/(?:^|;\s*)cbt_session=([^;]+)/)
      const token  = match?.[1]
      return token ? this.jwt.verify<SessionPayload>(token) : null
    } catch { return null }
  }
}
