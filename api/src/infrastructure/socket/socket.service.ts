import { Injectable } from '@nestjs/common'
import { WebSocket } from 'ws'
import { WS, WsEvent, WsPayloads } from './socket.events'

@Injectable()
export class SocketService {
  private readonly admins   = new Map<string, Set<WebSocket>>()
  private readonly students = new Map<string, Set<WebSocket>>()
  private readonly meta     = new Map<WebSocket, { map: Map<string, Set<WebSocket>>; id: string }>()

  register(role: 'admin' | 'student', id: string, client: WebSocket): void {
    const map = role === 'admin' ? this.admins : this.students
    if (!map.has(id)) map.set(id, new Set())
    map.get(id)!.add(client)
    this.meta.set(client, { map, id })
  }

  unregister(client: WebSocket): void {
    const entry = this.meta.get(client)
    if (!entry) return
    const set = entry.map.get(entry.id)
    if (set) {
      set.delete(client)
      if (set.size === 0) entry.map.delete(entry.id)
    }
    this.meta.delete(client)
  }

  private emit(client: WebSocket, event: WsEvent, data: unknown): void {
    if (client.readyState === WebSocket.OPEN)
      client.send(JSON.stringify({ event, data }))
  }

  private toAll(map: Map<string, Set<WebSocket>>, event: WsEvent, data: unknown): void {
    map.forEach(set => set.forEach(ws => this.emit(ws, event, data)))
  }

  private toOne(map: Map<string, Set<WebSocket>>, id: string, event: WsEvent, data: unknown): void {
    map.get(id)?.forEach(ws => this.emit(ws, event, data))
  }

  coinsUpdated(payload: WsPayloads['coins:updated']): void {
    this.toAll(this.admins, WS.COINS_UPDATED, payload)
    if (payload.studentId) this.toOne(this.students, payload.studentId, WS.COINS_UPDATED, payload)
  }

  solicitudNew(payload: WsPayloads['solicitud:new']): void {
    this.toAll(this.admins, WS.SOLICITUD_NEW, payload)
  }

  solicitudUpdated(studentId: string, payload: WsPayloads['solicitud:updated']): void {
    this.toOne(this.students, studentId, WS.SOLICITUD_UPDATED, payload)
  }

  notificationForStudent(studentId: string, payload: WsPayloads['notification:new']): void {
    this.toOne(this.students, studentId, WS.NOTIFICATION_NEW, payload)
  }

  notificationForAdmins(payload: WsPayloads['notification:new']): void {
    this.toAll(this.admins, WS.NOTIFICATION_NEW, payload)
  }
}
