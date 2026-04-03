'use client'
import { useCallback, useEffect, useState } from 'react'
import { pushService } from '@/services/push.service'

export type PushState =
  | 'unsupported'   // browser lacks Service Worker / PushManager
  | 'denied'        // user blocked at browser/OS level
  | 'loading'       // initial check in progress
  | 'subscribed'    // subscribed and registered on server
  | 'unsubscribed'  // supported + permission default/granted, not yet subscribed

const SW_PATH = '/sw.js'

function isSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

async function registerSW() {
  const reg = await navigator.serviceWorker.register(SW_PATH)
  await navigator.serviceWorker.ready
  return reg
}

function urlBase64ToUint8Array(b64: string): Uint8Array {
  const pad    = '='.repeat((4 - (b64.length % 4)) % 4)
  const base64 = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/')
  const raw    = atob(base64)
  const out    = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>('loading')

  // On mount: check current browser state; auto-subscribe if permission already granted
  useEffect(() => {
    if (!isSupported()) { setState('unsupported'); return }
    let cancelled = false

    async function init() {
      try {
        if (Notification.permission === 'denied') { setState('denied'); return }

        const reg = await registerSW()
        const sub = await reg.pushManager.getSubscription()

        if (sub) {
          // Already subscribed in browser — ensure server knows
          try {
            const { publicKey } = await pushService.getVapidKey()
            if (publicKey) await pushService.subscribe(sub)
          } catch { /* non-critical */ }
          if (!cancelled) setState('subscribed')
          return
        }

        // Permission already granted but no subscription → auto-subscribe silently
        if (Notification.permission === 'granted') {
          try {
            const { publicKey } = await pushService.getVapidKey()
            if (publicKey) {
              const newSub = await reg.pushManager.subscribe({
                userVisibleOnly:      true,
                applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
              })
              await pushService.subscribe(newSub)
              if (!cancelled) setState('subscribed')
              return
            }
          } catch { /* fall through to unsubscribed */ }
        }

        if (!cancelled) setState('unsubscribed')
      } catch {
        if (!cancelled) setState('unsubscribed')
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  /** Request browser permission and subscribe. Shows the native browser dialog. */
  const requestAndSubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported()) return false
    setState('loading')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'unsubscribed')
        return false
      }
      const { publicKey } = await pushService.getVapidKey()
      if (!publicKey) throw new Error('Push not configured')
      const reg    = await registerSW()
      const sub    = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      })
      await pushService.subscribe(sub)
      setState('subscribed')
      return true
    } catch {
      setState('unsubscribed')
      return false
    }
  }, [])

  /** Best-effort cleanup — call before logout. */
  const unsubscribeForLogout = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration(SW_PATH)
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      if (!sub) return
      await pushService.unsubscribe(sub.endpoint).catch(() => {})
      await sub.unsubscribe()
    } catch { /* best-effort */ }
  }, [])

  return { state, requestAndSubscribe, unsubscribeForLogout }
}
