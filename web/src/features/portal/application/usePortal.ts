'use client'
// uses socket — subscribes to WS.COINS_UPDATED and WS.SOLICITUD_UPDATED
import { useEffect, useState }  from 'react'
import { useRouter }             from 'next/navigation'
import { portalService }         from '../infrastructure/portal.service'
import { authService }           from '@/services/auth.service'
import { useToast }              from '@/hooks/useToast'
import { usePushNotifications }  from '@/hooks/usePushNotifications'
import { useSocketEvent }        from '@/hooks/useSocketEvent'
import { WS }                    from '@/ws/events'
import { APP_ROUTES }            from '@/config/routes'
import type { StudentData, IndividualReward, PortalTab } from '../domain/types'

interface UsePortalReturn {
  student:         StudentData | null
  rewards:         IndividualReward[]
  tab:             PortalTab
  loading:         boolean
  requesting:      string | null
  logoutModalOpen: boolean
  setTab:          (tab: PortalTab) => void
  setLogoutModalOpen: (open: boolean) => void
  onStudentUpdate: (partial: Partial<StudentData>) => void
  onCoinsUpdate:   (coins: number) => void
  requestReward:   (rewardId: string) => Promise<void>
  logout:          () => Promise<void>
  reloadStudent:   () => Promise<void>
}

export function usePortal(): UsePortalReturn {
  const router                   = useRouter()
  const { showToast }            = useToast()
  const { unsubscribeForLogout } = usePushNotifications()

  const [student,         setStudent]         = useState<StudentData | null>(null)
  const [rewards,         setRewards]         = useState<IndividualReward[]>([])
  const [tab,             setTab]             = useState<PortalTab>('perfil')
  const [loading,         setLoading]         = useState(true)
  const [requesting,      setRequesting]      = useState<string | null>(null)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      portalService.getMe(),
      portalService.getRewards().catch(() => [] as IndividualReward[]),
    ]).then(([me, rews]) => {
      setStudent(me)
      setRewards(Array.isArray(rews) ? rews : [])
    }).finally(() => setLoading(false))
  }, [])

  useSocketEvent(WS.COINS_UPDATED, ({ studentId, studentCoins }: { studentId?: string; studentCoins?: number }) => {
    if (studentId && studentCoins !== undefined)
      setStudent(s => s ? { ...s, coins: studentCoins } : s)
  })

  useSocketEvent(WS.SOLICITUD_UPDATED, ({ id, status }: { id?: string; status?: string }) => {
    if (!id || !status) return
    setStudent(s => s ? {
      ...s,
      redemptionRequests: s.redemptionRequests.map(r => r.id === id ? { ...r, status } : r),
    } : s)
  })

  const onStudentUpdate = (partial: Partial<StudentData>) =>
    setStudent(s => s ? { ...s, ...partial } : s)

  const onCoinsUpdate = (coins: number) =>
    setStudent(s => s ? { ...s, coins } : s)

  const reloadStudent = async () => {
    try {
      const me = await portalService.getMe()
      setStudent(me)
    } catch { /* silent refresh */ }
  }

  const requestReward = async (rewardId: string) => {
    setRequesting(rewardId)
    try {
      const { message } = await portalService.requestReward(rewardId)
      showToast(message)
      const me = await portalService.getMe()
      setStudent(me)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error sending request', false)
    } finally { setRequesting(null) }
  }

  const logout = async () => {
    setLogoutModalOpen(false)
    await unsubscribeForLogout()
    await authService.logout()
    router.push(APP_ROUTES.LOGIN)
  }

  return {
    student, rewards, tab, loading, requesting, logoutModalOpen,
    setTab, setLogoutModalOpen,
    onStudentUpdate, onCoinsUpdate,
    requestReward, logout, reloadStudent,
  }
}
