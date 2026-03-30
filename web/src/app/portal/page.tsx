'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, ClipboardList, Home, LogOut } from 'lucide-react'
import { portalService, type StudentData, type IndividualReward } from '@/services/portal.service'
import { authService } from '@/services/auth.service'
import { PortalSkeleton }  from '@/features/portal/PortalSkeleton'
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
    await authService.logout()
    router.push('/login')
  }

  async function requestReward(rewardId: string) {
    setRequesting(rewardId)
    try {
      await portalService.requestReward(rewardId)
      showToast('¡Solicitud enviada!')
      const me = await portalService.getMe()
      setStudent(me)
    } finally { setRequesting(null) }
  }

  if (loading) return <PortalSkeleton />
  if (!student) return null

  const pendingCount = student.redemptionRequests.filter(r => r.status === 'pending').length

  const TABS: { id: Tab; icon: React.ElementType; label: string; badge?: number }[] = [
    { id: 'perfil',      icon: Home,          label: 'Perfil' },
    { id: 'recompensas', icon: Gift,          label: 'Premios' },
    { id: 'solicitudes', icon: ClipboardList, label: 'Mis Solicitudes', badge: pendingCount },
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

      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl px-2 py-2 shadow-2xl"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          {TABS.map(t => {
            const Icon   = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative flex flex-col items-center gap-1 px-5 py-2 rounded-xl text-[10px] font-semibold transition-all duration-200 ${
                  active ? 'bg-zinc-700/80 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}>
                <div className="relative">
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  {t.badge && t.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[9px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {t.badge > 9 ? '9+' : t.badge}
                    </span>
                  )}
                </div>
                {t.label}
              </button>
            )
          })}
        </div>
      </nav>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-zinc-700 text-zinc-100 px-5 py-2.5 rounded-full text-sm font-medium shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  )
}
