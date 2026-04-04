import { Injectable } from '@nestjs/common'
import { Server }      from 'socket.io'
import { WS, WsEvent, WsPayloads } from './socket.events'

@Injectable()
export class SocketService {
  private server: Server | null = null

  registerServer(server: Server): void {
    this.server = server
  }

  private emit(room: string, event: WsEvent, data: unknown): void {
    this.server?.to(room).emit(event, data)
  }

  coinsUpdated(payload: WsPayloads['coins:updated']): void {
    this.emit('admin', WS.COINS_UPDATED, payload)
    if (payload.studentId)
      this.emit(`student:${payload.studentId}`, WS.COINS_UPDATED, payload)
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
