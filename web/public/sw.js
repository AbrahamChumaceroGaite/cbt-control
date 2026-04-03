/* Service Worker — push notification handler */
'use strict'

self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload
  try { payload = event.data.json() } catch { payload = { title: 'Notificación', body: event.data.text() } }

  const options = {
    body:    payload.body  ?? '',
    icon:    payload.icon  ?? '/icon-192.png',
    badge:   '/icon-192.png',
    tag:     payload.tag   ?? 'cbt',
    data:    { url: payload.url ?? '/' },
    requireInteraction: false,
  }

  event.waitUntil(self.registration.showNotification(payload.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    }),
  )
})
