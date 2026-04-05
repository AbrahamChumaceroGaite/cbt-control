'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, ClipboardList, History, LogOut } from 'lucide-react'
import { portalService, type StudentData, type IndividualReward } from '@/services/portal.service'
import { authService } from '@/services/auth.service'
import { NotificationBell }   from '@/features/notifications/NotificationBell'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { FloatingNav }         from '@/components/shared/FloatingNav'
import { PortalSkeleton }      from '@/features/portal/PortalSkeleton'
import { PerfilTab }           from '@/features/portal/PerfilTab'
import { RecompensasTab }      from '@/features/portal/RecompensasTab'
import { SolicitudesTab }      from '@/features/portal/SolicitudesTab'
import { useSocketEvent }      from '@/hooks/useSocketEvent'
import { WS }                  from '@/ws/events'

type Tab = 'perfil' | 'recompensas' | 'solicitudes'

export default function PortalPage() {
  const router = useRouter()
  const [student,    setStudent]    = useState<StudentData | null>(null)
  const [rewards,    setRewards]    = useState<IndividualReward[]>([])
  const [tab,        setTab]        = useState<Tab>('perfil')
  const [loading,    setLoading]    = useState(true)
  const [requesting, setRequesting] = useState<string | null>(null)
  const [toast,      setToast]      = useState('')
  const { unsubscribeForLogout }    = usePushNotifications()

  useEffect(() => {
    Promise.all([
      portalService.getMe(),
      portalService.getRewards().catch(() => [] as IndividualReward[]),
    ]).then(([me, rews]) => {
      setStudent(me)
      setRewards(Array.isArray(rews) ? rews : [])
    }).finally(() => setLoading(false))
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function logout() {
    await unsubscribeForLogout()
    await authService.logout()
    router.push('/login')
  }

  async function requestReward(rewardId: string) {
    setRequesting(rewardId)
    try {
      const { message } = await portalService.requestReward(rewardId)
      showToast(message)
      const me = await portalService.getMe()
      setStudent(me)
    } catch (err: any) {
      showToast(err.message ?? 'Error al enviar solicitud')
    } finally { setRequesting(null) }
  }

  useSocketEvent(WS.COINS_UPDATED, ({ studentId, studentCoins }) => {
    if (studentId && studentCoins !== undefined)
      setStudent(s => s ? { ...s, coins: studentCoins } : s)
  })

  useSocketEvent(WS.SOLICITUD_UPDATED, ({ id, status }) => {
    setStudent(s => s ? {
      ...s,
      redemptionRequests: s.redemptionRequests.map(r => r.id === id ? { ...r, status } : r),
    } : s)
  })

  if (loading) return <PortalSkeleton />
  if (!student) return null

  const solicitudesCount = student.redemptionRequests.filter(r => r.status === 'pending').length

  const TABS: { id: Tab; icon: React.ElementType; label: string; badge?: number }[] = [
    { id: 'perfil',      icon: History,       label: 'Inicio' },
    { id: 'recompensas', icon: Gift,           label: 'Premios' },
    { id: 'solicitudes', icon: ClipboardList,  label: 'Solicitudes', badge: solicitudesCount },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-x-hidden">
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Fixed top-right: notification + logout — always visible over all tabs */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5">
        <NotificationBell />
        <button
          onClick={logout}
          className="w-8 h-8 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/60 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab content */}
      <main className="relative z-10">
        {tab === 'perfil' && (
          <PerfilTab
            student={student}
            rewards={rewards}
            onStudentUpdate={partial => setStudent(s => s ? { ...s, ...partial } : s)}
          />
        )}
        {tab === 'recompensas' && (
          <div className="pt-14 px-4 pb-28 max-w-2xl mx-auto">
            <RecompensasTab student={student} rewards={rewards} requesting={requesting} onRequest={requestReward} />
          </div>
        )}
        {tab === 'solicitudes' && (
          <div className="pt-14 px-4 pb-28 max-w-2xl mx-auto">
            <SolicitudesTab requests={student.redemptionRequests} />
          </div>
        )}
      </main>

      <FloatingNav tabs={TABS} active={tab} onTabChange={setTab} />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-zinc-700 text-zinc-100 px-5 py-2.5 rounded-full text-sm font-medium shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  )
}
