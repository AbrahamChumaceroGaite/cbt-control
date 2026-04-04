import { Injectable, Logger } from '@nestjs/common'
import { Server } from 'socket.io'
import { WS, WsEvent, WsPayloads } from './socket.events'

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name)
  private server: Server | null = null

  registerServer(server: Server): void {
    this.server = server
    this.logger.log('Socket.IO server registered')
  }

  emit<E extends WsEvent>(rooms: string | string[], event: E, payload: WsPayloads[E]): void {
    if (!this.server) return
    this.server.to(rooms).emit(event, payload)
  }

  coinsUpdated(payload: WsPayloads['coins:updated']): void {
    const rooms: string[] = [`course:${payload.courseId}`]
    if (payload.studentId) rooms.push(`student:${payload.studentId}`)
    this.emit(rooms, WS.COINS_UPDATED, payload)
  }

  solicitudNew(payload: WsPayloads['solicitud:new']): void {
    this.emit('admin', WS.SOLICITUD_NEW, payload)
  }

  solicitudUpdated(studentId: string, payload: WsPayloads['solicitud:updated']): void {
    this.emit(`student:${studentId}`, WS.SOLICITUD_UPDATED, payload)
  }

  notificationForStudent(studentId: string, payload: WsPayloads['notification:new']): void {
    this.emit(`student:${studentId}`, WS.NOTIFICATION_NEW, payload)
  }

  notificationForAdmins(payload: WsPayloads['notification:new']): void {
    this.emit('admin', WS.NOTIFICATION_NEW, payload)
  }
}
