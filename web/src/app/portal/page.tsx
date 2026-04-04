'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, ClipboardList, Home, LogOut } from 'lucide-react'
import { portalService, type StudentData, type IndividualReward } from '@/services/portal.service'
import { authService } from '@/services/auth.service'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { FloatingNav }     from '@/components/shared/FloatingNav'
import { PortalSkeleton }  from '@/features/portal/PortalSkeleton'
import { useSocketEvent } from '@/hooks/useSocketEvent'
import { WS }              from '@/socket/events'
import { PerfilTab }       from '@/features/portal/PerfilTab'
import { RecompensasTab }  from '@/features/portal/RecompensasTab'
import { SolicitudesTab }  from '@/features/portal/SolicitudesTab'

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
  }, [router])

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

  const solicitudesCount = student.redemptionRequests.length

  const TABS: { id: Tab; icon: React.ElementType; label: string; badge?: number }[] = [
    { id: 'perfil',      icon: Home,          label: 'Perfil' },
    { id: 'recompensas', icon: Gift,          label: 'Premios' },
    { id: 'solicitudes', icon: ClipboardList, label: 'Mis Solicitudes', badge: solicitudesCount },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-28 relative overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <header className="sticky top-0 z-30 px-5 pt-5 pb-3">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between bg-zinc-900/90 backdrop-blur-md border border-zinc-800/60 rounded-2xl px-5 py-3 shadow-xl"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 text-sm font-black">{student.name.charAt(0)}</span>
              </div>
              <div>
                <div className="font-bold text-sm text-zinc-100 leading-none">{student.name.split(' ').slice(0, 2).join(' ')}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{student.course.level} · {student.course.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xl font-black text-amber-400 leading-none">{student.coins}</div>
                <div className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">coins</div>
              </div>
              <NotificationBell />
              <button onClick={logout}
                className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-all">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-4">
        {tab === 'perfil'      && <PerfilTab      student={student} />}
        {tab === 'recompensas' && <RecompensasTab student={student} rewards={rewards} requesting={requesting} onRequest={requestReward} />}
        {tab === 'solicitudes' && <SolicitudesTab requests={student.redemptionRequests} />}
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
