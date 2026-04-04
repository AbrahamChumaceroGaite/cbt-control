/** Mirror of api/src/infrastructure/socket/socket.events.ts — keep in sync. */

export const WS = {
  COINS_UPDATED:     'coins:updated',
  SOLICITUD_NEW:     'solicitud:new',
  SOLICITUD_UPDATED: 'solicitud:updated',
  NOTIFICATION_NEW:  'notification:new',
} as const

export type WsEvent = typeof WS[keyof typeof WS]

export interface WsPayloads {
  'coins:updated': {
    courseId:      string
    classCoins?:   number
    studentId?:    string
    studentCoins?: number
  }
  'solicitud:new': {
    id:          string
    studentName: string
    rewardName:  string
  }
  'solicitud:updated': {
    id:     string
    status: string
  }
  'notification:new': {
    id:        string
    title:     string
    body:      string
    createdAt: string
  }
}
