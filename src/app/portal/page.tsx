'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Coins, BookOpen, Gift, ClipboardList, LogOut, Home } from 'lucide-react'

type CoinLogEntry = {
  id: string; coins: number; reason: string; createdAt: string
  action?: { name: string; category: string } | null
}
type RedemptionReq = {
  id: string; status: string; createdAt: string; notes: string
  reward: { name: string; icon: string; coinsRequired: number }
}
type GroupEntry = { group: { id: string; name: string } }
type IndividualReward = {
  id: string; name: string; icon: string; coinsRequired: number; description: string
}
type StudentData = {
  id: string; name: string; coins: number
  course: { id: string; name: string; level: string; classCoins: number }
  coinLogs: CoinLogEntry[]
  groupMemberships: GroupEntry[]
  redemptionRequests: RedemptionReq[]
  individualRedemptions: { rewardId: string }[]
}

type Tab = 'perfil' | 'recompensas' | 'solicitudes'

const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  green:  { text: '#4ade80', bg: '#052e16' },
  blue:   { text: '#60a5fa', bg: '#0c1a3d' },
  red:    { text: '#f87171', bg: '#3b0000' },
  amber:  { text: '#fbbf24', bg: '#2d1a00' },
  purple: { text: '#c084fc', bg: '#2d0052' },
  mag:    { text: '#e879f9', bg: '#330030' },
}

// Skeleton block
function Skel({ className }: { className: string }) {
  return <div className={`bg-zinc-800 animate-pulse rounded-xl ${className}`} />
}

function PortalSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* header skel */}
      <div className="border-b border-zinc-800/50 px-5 py-4 flex items-center justify-between">
        <div className="space-y-2">
          <Skel className="h-5 w-36" />
          <Skel className="h-3 w-24" />
        </div>
        <Skel className="h-10 w-16 rounded-full" />
      </div>
      <div className="max-w-xl mx-auto p-5 space-y-4 mt-4">
        <Skel className="h-36 w-full" />
        <Skel className="h-20 w-full" />
        <Skel className="h-20 w-full" />
        <Skel className="h-20 w-full" />
      </div>
    </div>
  )
}

export default function PortalPage() {
  const router = useRouter()
  const [student, setStudent] = useState<StudentData | null>(null)
  const [rewards, setRewards] = useState<IndividualReward[]>([])
  const [tab, setTab] = useState<Tab>('perfil')
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/me').then(r => r.json()),
      fetch('/api/portal/recompensas').then(r => r.json()).catch(() => []),
    ]).then(([me, rews]) => {
      if (me?.error) { router.push('/login'); return }
      setStudent(me)
      setRewards(Array.isArray(rews) ? rews : [])
    }).finally(() => setLoading(false))
  }, [router])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  async function requestReward(rewardId: string) {
    setRequesting(rewardId)
    try {
      const res = await fetch('/api/portal/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Error'); return }
      showToast('¡Solicitud enviada!')
      const me = await fetch('/api/portal/me').then(r => r.json())
      setStudent(me)
    } finally { setRequesting(null) }
  }

  if (loading) return <PortalSkeleton />
  if (!student) return null

  const pendingCount = student.redemptionRequests.filter(r => r.status === 'pending').length

  const TABS: { id: Tab; icon: any; label: string; badge?: number }[] = [
    { id: 'perfil',       icon: Home,          label: 'Perfil' },
    { id: 'recompensas',  icon: Gift,          label: 'Premios' },
    { id: 'solicitudes',  icon: ClipboardList, label: 'Mis Solicitudes', badge: pendingCount },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-28 relative overflow-x-hidden">
      {/* ── Animated blobs ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* ── Header ── */}
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
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-xl mx-auto px-4 pt-4">

        {/* PERFIL TAB */}
        {tab === 'perfil' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Coins hero */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 p-6"
              style={{ background: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                style={{ background: 'radial-gradient(#fbbf24, transparent)' }} />
              <div className="relative z-10">
                <div className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">Mis Coins</div>
                <div className="text-6xl font-black text-amber-400 mb-1">{student.coins}</div>
                <div className="text-zinc-600 text-sm">coins acumulados</div>
              </div>
            </div>

            {/* Course coins */}
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800/60 rounded-2xl px-5 py-4">
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Curso {student.course.name}</div>
                <div className="text-sm text-zinc-300">Coins grupales</div>
              </div>
              <div className="text-3xl font-black text-blue-400">{student.course.classCoins}</div>
            </div>

            {/* Groups */}
            {student.groupMemberships.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl px-5 py-4">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Mis Grupos</div>
                <div className="flex flex-wrap gap-2">
                  {student.groupMemberships.map(m => (
                    <div key={m.group.id} className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300">
                      <span>👥</span> {m.group.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent history */}
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/60">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Historial reciente</div>
              </div>
              {student.coinLogs.length === 0 ? (
                <div className="px-5 py-8 text-center text-zinc-600 text-sm">Sin movimientos aún</div>
              ) : (
                <div className="divide-y divide-zinc-800/40">
                  {student.coinLogs.map(log => {
                    const cat = log.action?.category ?? ''
                    const col = CATEGORY_COLORS[cat] ?? { text: '#a1a1aa', bg: '#18181b' }
                    return (
                      <div key={log.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col.text }} />
                          <div className="min-w-0">
                            <div className="text-sm text-zinc-300 truncate">{log.action?.name ?? log.reason}</div>
                            <div className="text-xs text-zinc-600 mt-0.5">
                              {new Date(log.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        <div className={`text-base font-bold ml-4 shrink-0 ${log.coins >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {log.coins > 0 ? '+' : ''}{log.coins}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RECOMPENSAS TAB */}
        {tab === 'recompensas' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <div className="text-xs text-zinc-600 pb-1">Tienes <span className="text-amber-400 font-bold">{student.coins} coins</span> disponibles</div>
            {rewards.length === 0 ? (
              <div className="text-center py-16 text-zinc-600">No hay recompensas disponibles</div>
            ) : (
              rewards.map(r => {
                const canAfford = student.coins >= r.coinsRequired
                const alreadyRedeemed = student.individualRedemptions.some(ir => ir.rewardId === r.id)
                const alreadyPending = student.redemptionRequests.some(
                  req => req.reward.name === r.name && req.status === 'pending'
                )
                if (alreadyRedeemed) return null
                return (
                  <div key={r.id} className={`flex items-center gap-4 bg-zinc-900 border rounded-2xl p-4 transition-all ${canAfford ? 'border-zinc-700/60' : 'border-zinc-800/40 opacity-60'}`}>
                    <div className="text-3xl shrink-0">{r.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-zinc-200 text-sm leading-tight">{r.name}</div>
                      {r.description && <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{r.description}</div>}
                      <div className={`text-xs font-bold mt-1.5 ${canAfford ? 'text-amber-400' : 'text-zinc-600'}`}>
                        {r.coinsRequired} coins
                      </div>
                    </div>
                    <button
                      onClick={() => !alreadyPending && canAfford && requestReward(r.id)}
                      disabled={!canAfford || alreadyPending || requesting === r.id}
                      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        alreadyPending
                          ? 'bg-zinc-800 text-zinc-500 cursor-default'
                          : canAfford
                            ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95'
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      {requesting === r.id ? '...' : alreadyPending ? 'Enviado' : 'Pedir'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* SOLICITUDES TAB */}
        {tab === 'solicitudes' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {student.redemptionRequests.length === 0 ? (
              <div className="text-center py-16 text-zinc-600">Sin solicitudes aún</div>
            ) : (
              student.redemptionRequests.map(req => (
                <div key={req.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800/60 rounded-2xl p-4">
                  <div className="text-3xl shrink-0">{req.reward.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-zinc-200 text-sm">{req.reward.name}</div>
                    <div className="text-xs text-zinc-600 mt-0.5">
                      {new Date(req.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    {req.notes && <div className="text-xs text-zinc-400 mt-1 italic">"{req.notes}"</div>}
                  </div>
                  <div className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold ${
                    req.status === 'approved' ? 'bg-green-950 text-green-400 border border-green-800/40' :
                    req.status === 'rejected' ? 'bg-red-950 text-red-400 border border-red-800/40' :
                    'bg-amber-950 text-amber-400 border border-amber-800/40'
                  }`}>
                    {req.status === 'approved' ? '✓ Aprobado' : req.status === 'rejected' ? '✕ Rechazado' : '⏳ Pendiente'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ── Floating Nav (same style as admin) ── */}
      <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-2xl px-2 py-2 shadow-2xl"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative flex flex-col items-center gap-1 px-5 py-2 rounded-xl text-[10px] font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-zinc-700/80 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-zinc-700 text-zinc-100 px-5 py-2.5 rounded-full text-sm font-medium shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  )
}
