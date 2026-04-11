import { api } from '@/lib/api'
import { API_ROUTES } from '@/config/routes'

export const pushService = {
  getVapidKey: () =>
    api<{ publicKey: string }>(API_ROUTES.PUSH.VAPID).then(r => r.data),

  subscribe: (sub: PushSubscription) =>
    api<void>(API_ROUTES.PUSH.SUBSCRIBE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey('p256dh')!),
          auth:   arrayBufferToBase64(sub.getKey('auth')!),
        },
      }),
    }).then(r => r.data),

  unsubscribe: (endpoint: string) =>
    api<void>(API_ROUTES.PUSH.UNSUBSCRIBE, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ endpoint }),
    }).then(r => r.data),
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(Array.from(new Uint8Array(buffer), b => String.fromCharCode(b)).join(''))
}
