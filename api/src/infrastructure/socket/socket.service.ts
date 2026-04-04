import { Injectable } from '@nestjs/common'
import { MessageEvent } from '@nestjs/common'
import { Observable, Subject, finalize } from 'rxjs'
import { WS, WsEvent, WsPayloads } from './socket.events'

@Injectable()
export class SocketService {
  private readonly adminStreams   = new Map<string, Set<Subject<MessageEvent>>>()
  private readonly studentStreams = new Map<string, Set<Subject<MessageEvent>>>()

  subscribeAdmin(userId: string): Observable<MessageEvent> {
    return this.addStream(this.adminStreams, userId)
  }

  subscribeStudent(studentId: string): Observable<MessageEvent> {
    return this.addStream(this.studentStreams, studentId)
  }

  private addStream<K>(map: Map<K, Set<Subject<MessageEvent>>>, key: K): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>()
    if (!map.has(key)) map.set(key, new Set())
    map.get(key)!.add(subject)
    return subject.asObservable().pipe(
      finalize(() => {
        map.get(key)?.delete(subject)
        if (map.get(key)?.size === 0) map.delete(key)
      }),
    )
  }

  private msg(event: WsEvent, data: unknown): MessageEvent {
    return { data: JSON.stringify({ event, data }) }
  }

  private toAdmins(event: WsEvent, data: unknown): void {
    const m = this.msg(event, data)
    this.adminStreams.forEach(set => set.forEach(s => s.next(m)))
  }

  private toStudent(studentId: string, event: WsEvent, data: unknown): void {
    this.studentStreams.get(studentId)?.forEach(s => s.next(this.msg(event, data)))
  }

  coinsUpdated(payload: WsPayloads['coins:updated']): void {
    this.toAdmins(WS.COINS_UPDATED, payload)
    if (payload.studentId) this.toStudent(payload.studentId, WS.COINS_UPDATED, payload)
  }

  solicitudNew(payload: WsPayloads['solicitud:new']): void {
    this.toAdmins(WS.SOLICITUD_NEW, payload)
  }

  solicitudUpdated(studentId: string, payload: WsPayloads['solicitud:updated']): void {
    this.toStudent(studentId, WS.SOLICITUD_UPDATED, payload)
  }

  notificationForStudent(studentId: string, payload: WsPayloads['notification:new']): void {
    this.toStudent(studentId, WS.NOTIFICATION_NEW, payload)
  }

  notificationForAdmins(payload: WsPayloads['notification:new']): void {
    this.toAdmins(WS.NOTIFICATION_NEW, payload)
  }
}
