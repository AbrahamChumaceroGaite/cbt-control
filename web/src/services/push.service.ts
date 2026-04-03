import { apiFetch } from '@/lib/api'

export const pushService = {
  getVapidKey: () =>
    apiFetch<{ publicKey: string }>('/api/push/vapid-key'),

  subscribe: (sub: PushSubscription) =>
    apiFetch<void>('/api/push/subscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(sub.getKey('p256dh')!),
          auth:   arrayBufferToBase64(sub.getKey('auth')!),
        },
      }),
    }),

  unsubscribe: (endpoint: string) =>
    apiFetch<void>('/api/push/unsubscribe', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ endpoint }),
    }),
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(Array.from(new Uint8Array(buffer), b => String.fromCharCode(b)).join(''))
}
