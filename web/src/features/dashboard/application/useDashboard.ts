'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter }            from 'next/navigation'
import { authService }          from '@/services/auth.service'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useSocketEvent }       from '@/hooks/useSocketEvent'
import { WS }                   from '@/ws/events'
import { APP_ROUTES }           from '@/config/routes'
import type { AppTab } from '../domain/types'

export function useDashboard() {
  const router = useRouter()
  const [tab,                setTab]                = useState<AppTab>('aula')
  const [adminName,          setAdminName]          = useState('CBT')
  const [pendingSolicitudes, setPendingSolicitudes] = useState(0)
  const { unsubscribeForLogout } = usePushNotifications()

  useEffect(() => {
    authService.me().then(d => {
      if (d?.fullName) setAdminName(d.fullName)
      else if (d?.code) setAdminName(d.code)
    }).catch(() => {})
  }, [])

  useSocketEvent(WS.SOLICITUD_NEW, () => {
    setPendingSolicitudes(n => n + 1)
  })

  const logout = useCallback(async () => {
    await unsubscribeForLogout()
    await authService.logout()
    router.push(APP_ROUTES.LOGIN)
  }, [unsubscribeForLogout, router])

  return { tab, setTab, adminName, pendingSolicitudes, setPendingSolicitudes, logout }
}
