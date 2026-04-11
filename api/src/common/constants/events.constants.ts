/** Mirror of web/src/ws/events.ts — keep in sync. */
export const WS_EVENTS = {
  COINS_UPDATED:       'coins:updated',
  SOLICITUD_NEW:       'solicitud:new',
  SOLICITUD_UPDATED:   'solicitud:updated',
  NOTIFICATION_NEW:    'notification:new',
  TRANSACTION_NEW:     'transaction:new',
  TRANSACTION_UPDATED: 'transaction:updated',
} as const

export type WsEvent = typeof WS_EVENTS[keyof typeof WS_EVENTS]
