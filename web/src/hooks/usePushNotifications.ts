'use client'
import { useCallback, useEffect, useState } from 'react'
import { pushService } from '@/services/push.service'

export type PushState =
  | 'unsupported'   // browser has no Service Worker / PushManager
  | 'denied'        // user blocked notifications at OS/browser level
  | 'loading'       // checking current state or in-flight operation
  | 'subscribed'    // subscribed and registered on server
  | 'unsubscribed'  // supported + allowed, but not yet subscribed

const SW_PATH = '/sw.js'

function isSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>('loading')
  const [error, setError] = useState<string | null>(null)

  // Derive the current state from the browser on mount
  useEffect(() => {
    if (!isSupported()) { setState('unsupported'); return }

    let cancelled = false

    async function check() {
      try {
        if (Notification.permission === 'denied') { setState('denied'); return }

        const reg = await navigator.serviceWorker.register(SW_PATH)
        await navigator.serviceWorker.ready

        const sub = await reg.pushManager.getSubscription()
        if (!cancelled) setState(sub ? 'subscribed' : 'unsubscribed')
      } catch {
        if (!cancelled) setState('unsubscribed')
      }
    }

    check()
    return () => { cancelled = true }
  }, [])

  const subscribe = useCallback(async () => {
    if (!isSupported()) return
    setError(null)
    setState('loading')
    try {
      // Request permission if not yet granted
      const permission = await Notification.requestPermission()
      if (permission === 'denied') { setState('denied'); return }
      if (permission !== 'granted') { setState('unsubscribed'); return }

      const { publicKey } = await pushService.getVapidKey()
      if (!publicKey) throw new Error('VAPID key not configured')

      const reg = await navigator.serviceWorker.register(SW_PATH)
      await navigator.serviceWorker.ready

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      })

      await pushService.subscribe(sub)
      setState('subscribed')
    } catch (err: any) {
      setError(err?.message ?? 'Error al activar notificaciones')
      setState('unsubscribed')
    }
  }, [])

  /** Call this BEFORE clearing auth cookies (e.g., on logout). */
  const unsubscribeForLogout = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration(SW_PATH)
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return
      await pushService.unsubscribe(sub.endpoint).catch(() => {})
      await sub.unsubscribe()
    } catch {
      // best-effort cleanup on logout
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    if (!isSupported()) return
    setError(null)
    setState('loading')
    try {
      const reg = await navigator.serviceWorker.getRegistration(SW_PATH)
      if (reg) {
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await pushService.unsubscribe(sub.endpoint)
          await sub.unsubscribe()
        }
      }
      setState('unsubscribed')
    } catch (err: any) {
      setError(err?.message ?? 'Error al desactivar notificaciones')
      setState('subscribed')
    }
  }, [])

  return { state, error, subscribe, unsubscribe, unsubscribeForLogout }
}

// Converts a URL-safe base64 VAPID key to Uint8Array (required by PushManager.subscribe)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  const output  = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}
