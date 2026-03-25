'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { TRAMOS, ACTION_COLORS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Home, BookType, Users, Network, Zap, Gift, Plus, Upload, X, Check, Search, TrendingUp, Trophy, ArrowRightCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

/* ── Types ── */
type Course = { id: string; name: string; plant: string; level: string; parallel: string; classPoints: number; _count?: { students: number } }
type Student = { id: string; courseId: string; name: string; code: string; email: string | null; points: number; tramos: { tramo: string }[]; course?: { name: string } }
type Action = { id: string; name: string; points: number; category: string; affectsClass: boolean; affectsStudent: boolean; isActive: boolean }
type Reward = { id: string; name: string; description: string; icon: string; pointsRequired: number; type: string; isGlobal: boolean; isActive: boolean }
type Log = { id: string; points: number; reason: string; createdAt: string; student?: { name: string } | null; action?: { name: string, category: string } | null }
type Group = { id: string; name: string; courseId: string; members: { id: string; studentId: string; student: { id: string; name: string; points: number } }[] }

type Tab = 'aula' | 'cursos' | 'estudiantes' | 'grupos' | 'acciones' | 'recompensas'

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'aula', label: 'Dashboard', icon: Home },
  { id: 'cursos', label: 'Cursos', icon: BookType },
  { id: 'estudiantes', label: 'Alumnos', icon: Users },
  { id: 'grupos', label: 'Grupos', icon: Network },
  { id: 'acciones', label: 'Acciones', icon: Zap },
  { id: 'recompensas', label: 'Premios', icon: Gift },
]

const CATEGORIES = [
  { value: 'green',  label: 'Verde — positivo',     bg: '#166534', fg: '#bbf7d0' },
  { value: 'blue',   label: 'Azul — colaboración',  bg: '#1e3a8a', fg: '#bfdbfe' },
  { value: 'purple', label: 'Morado — tramos',      bg: '#4c1d95', fg: '#ddd6fe' },
  { value: 'amber',  label: 'Ámbar — entregas',     bg: '#78350f', fg: '#fef3c7' },
  { value: 'mag',    label: 'Magenta — especial',   bg: '#831843', fg: '#fbcfe8' },
  { value: 'red',    label: 'Rojo — negativo',      bg: '#7f1d1d', fg: '#fecaca' },
]

const ICONS = ['★', '♪', '♫', '▶', '◉', '⇄', '◆', '+', '❄', '⚡', '♛', '⊕']

/* ── UI Components ── */
function Modal({ open, onClose, title, lg, children }: { open: boolean; onClose: () => void; title: string; lg?: boolean; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={cn("modal-content", lg && "max-w-2xl")} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {title}
            <button onClick={onClose} className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><X size={18} /></button>
          </h2>
        </div>
        <div className="modal-body space-y-4">{children}</div>
      </div>
    </div>
  )
}

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={cn("flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border", ok ? "bg-[#064e3b]/90 border-[#047857] text-[#34d399]" : "bg-[#7f1d1d]/90 border-[#b91c1c] text-[#fca5a5]")}>
        {ok ? <Check size={18} /> : <X size={18} />}
        <span className="text-sm font-medium text-white">{msg}</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [tab, setTab] = useState<Tab>('aula')
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [currentCourse, setCurrentCourse] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  
  const showToast = useCallback((msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000) }, [])

  /* ── Data loading ── */
  const loadAll = useCallback(async () => {
    const [c, a, r] = await Promise.all([
      fetch('/api/cursos').then(r => r.json()),
      fetch('/api/acciones').then(r => r.json()),
      fetch('/api/recompensas').then(r => r.json()),
    ])
    setCourses(c)
    setActions(a)
    setRewards(r)
    if (c.length && !currentCourse) {
      setCurrentCourse(c[0].id)
      loadCourse(c[0].id)
    }
  }, [currentCourse])

  const loadCourse = async (id: string) => {
    const [s, detail, g] = await Promise.all([
      fetch(`/api/estudiantes?courseId=${id}`).then(r => r.json()),
      fetch(`/api/cursos/${id}`).then(r => r.json()),
      fetch(`/api/grupos?courseId=${id}`).then(r => r.json()),
    ])
    setStudents(s)
    setLogs(detail.pointLogs || [])
    setGroups(g)
  }

  useEffect(() => { loadAll() }, [loadAll])
  useEffect(() => { if (currentCourse) loadCourse(currentCourse) }, [currentCourse])

  const course = courses.find(c => c.id === currentCourse)

  return (
    <div className="min-h-screen bg-zinc-950 page-wrapper">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/50 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Control Aula
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] tracking-widest font-semibold uppercase relative top-[1px]">PRO</span>
          </h1>
        </div>
        
        {courses.length > 0 && (
          <div className="flex items-center gap-2">
            <select 
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-700"
              value={currentCourse} onChange={(e) => setCurrentCourse(e.target.value)}
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {course?.plant && <div className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1.5 rounded-md border border-emerald-400/20 hidden sm:block">🌱 {course.plant}</div>}
          </div>
        )}
      </header>

      {/* ── Main Content Area ── */}
      <main className="p-6 mx-auto max-w-[1400px]">
        {tab === 'aula' && <AulaSection course={course} students={students} actions={actions} rewards={rewards} logs={logs} reload={() => loadCourse(currentCourse)} showToast={showToast} />}
        {tab === 'cursos' && <CursosSection courses={courses} reload={loadAll} showToast={showToast} />}
        {tab === 'estudiantes' && <EstudiantesSection students={students} currentCourse={currentCourse} reload={() => loadCourse(currentCourse)} reloadAll={loadAll} showToast={showToast} />}
        {tab === 'grupos' && <GruposSection groups={groups} students={students} currentCourse={currentCourse} reload={() => loadCourse(currentCourse)} showToast={showToast} />}
        {tab === 'acciones' && <AccionesSection actions={actions} reload={loadAll} showToast={showToast} />}
        {tab === 'recompensas' && <RecompensasSection rewards={rewards} reload={loadAll} showToast={showToast} />}
      </main>

      {/* ── Floating Bottom Navigation ── */}
      <nav className="floating-nav">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("nav-item", tab === t.id && "active")}>
              <Icon className="nav-icon" strokeWidth={tab === t.id ? 2.5 : 2} />
              <span className="nav-label">{t.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   AULA SECTION — Clean Dashboard
   ══════════════════════════════════════════════════════════════════ */
function AulaSection({ course, students, actions, rewards, logs, reload, showToast }: any) {
  const [awardModal, setAwardModal] = useState(false)
  const [claimModal, setClaimModal] = useState<{ reward: Reward; student?: Student } | null>(null)
  const [awardTarget, setAwardTarget] = useState<'class' | string>('class') // 'class' or studentId

  const topStudents = [...students].sort((a: Student, b: Student) => b.points - a.points).slice(0, 5)
  const activeActions = actions.filter((a: Action) => a.isActive)
  
  // Progress Timeline tracking
  const classRewards = (rewards || []).filter((r: Reward) => r.type === 'class' && r.isActive).sort((a: Reward, b: Reward) => a.pointsRequired - b.pointsRequired)
  const individualRewards = (rewards || []).filter((r: Reward) => r.type === 'individual' && r.isActive).sort((a: Reward, b: Reward) => a.pointsRequired - b.pointsRequired)
  const globalRewards = classRewards // class rewards drive the class progress timeline
  const timelineRewards = [
    { id: 'start', name: 'Inicio de Curso', pointsRequired: 0, icon: '🚀', isGlobal: true, isActive: true } as Reward,
    ...globalRewards
  ]
  const currentPts = course?.classPoints ?? 0
  const maxRewardPoints = globalRewards.length ? globalRewards[globalRewards.length - 1].pointsRequired : 1000
  const nextReward = globalRewards.find((r: Reward) => r.pointsRequired > currentPts)
  const maxGoal = Math.max(maxRewardPoints, currentPts + (currentPts >= maxRewardPoints ? 50 : 0)) // No limit
  
  const awardPoints = async (pts: number, reason: string, actionId?: string) => {
    const studentId = awardTarget === 'class' ? undefined : awardTarget
    const res = await fetch('/api/puntos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: course.id, studentId, actionId, points: pts, reason }),
    })
    if (res.ok) {
      showToast(`${pts > 0 ? '+' : ''}${pts} pts — ${reason}`, pts > 0)
      setAwardModal(false)
      reload()
    }
  }

  const claimReward = async () => {
    if (!claimModal) return
    const { reward, student: claimStudent } = claimModal
    const body = claimStudent
      ? { courseId: course.id, studentId: claimStudent.id, points: 0, reason: `🎁 Canjeado: ${reward.name}` }
      : { courseId: course.id, points: 0, reason: `🎁 Canjeado: ${reward.name}` }
    const res = await fetch('/api/puntos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      showToast(`¡Se ha reclamado: ${reward.name}!`)
      setClaimModal(null)
      reload()
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── Header with Actions ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Clase Activa</h2>
          <p className="text-zinc-400 text-sm mt-1">Sigue el progreso de {course?.name || 'la clase'} en la línea de tiempo de recompensas.</p>
        </div>
        <button className="btn btn-action-primary px-5 py-2.5 rounded-full shadow-lg shadow-blue-900/20" onClick={() => setAwardModal(true)}>
          <Plus size={16} className="mr-2" />
          Otorgar Puntos
        </button>
      </div>

      {/* ── Class Goal Timeline (Scrollable Stepper) ── */}
      <div className="card-base p-6 relative group overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-all"></div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 relative z-10 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" /> Gran Ruta de Recompensas
            </h3>
            <p className="text-sm font-medium mt-1 text-zinc-300">
              {nextReward ? <span>Próximo desbloqueo: <strong className="text-emerald-400">{nextReward.icon} {nextReward.name}</strong> a los {nextReward.pointsRequired} pts</span> : <strong className="text-emerald-400">¡Han superado todas las metas globales configuradas!</strong>}
            </p>
          </div>
          <div className="text-right whitespace-nowrap bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl shadow-inner">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">{currentPts}</span>
            <span className="text-zinc-500 font-bold ml-2 text-sm uppercase tracking-wider">pts totales</span>
          </div>
        </div>

        {/* Scrollable Stepper Timeline */}
        <div className="relative w-full overflow-x-auto pb-4 pt-10 mt-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <div className="flex items-center min-w-max pb-16">
            {timelineRewards.map((r, i) => {
               const isReached = currentPts >= r.pointsRequired
               const isNext = nextReward?.id === r.id
               const isAlreadyClaimed = logs.some((l: Log) => l.reason === `🎁 Canjeado: ${r.name}`)
               const canClaim = isReached && r.id !== 'start' && !isAlreadyClaimed

               const nextR = timelineRewards[i+1]
               let segmentFill = 0
               if (nextR) {
                  if (currentPts >= nextR.pointsRequired) segmentFill = 100
                  else if (currentPts > r.pointsRequired) {
                     segmentFill = ((currentPts - r.pointsRequired) / (nextR.pointsRequired - r.pointsRequired)) * 100
                  }
               }

               return (
                  <div key={r.id} className="relative flex items-center">
                     {/* Node */}
                     <div className="relative flex flex-col items-center z-10 w-28 sm:w-36">
                        <div
                          onClick={() => canClaim && setClaimModal({ reward: r })}
                          className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-4 shadow-xl transition-all relative z-10",
                           canClaim ? "bg-amber-400 border-amber-200 text-amber-900 shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-110 cursor-pointer hover:scale-125" :
                           isAlreadyClaimed ? "bg-zinc-800 border-zinc-600 text-zinc-400 opacity-80" :
                           isNext ? "bg-zinc-900 border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] ring-4 ring-emerald-500/20 animate-pulse scale-110" :
                           "bg-zinc-900 border-zinc-800 text-zinc-600"
                        )}>
                           {isAlreadyClaimed ? <Check size={22} className="text-zinc-500" /> : <span className={cn("text-xl sm:text-3xl drop-shadow-sm", !isReached && !isNext && "opacity-50 grayscale")}>{r.icon}</span>}
                        </div>

                        {/* Label */}
                        <div className="absolute top-16 sm:top-20 flex flex-col items-center w-full text-center px-1">
                           <span className={cn("text-[10px] sm:text-xs font-bold leading-tight mb-1",
                             canClaim ? "text-amber-400" : isAlreadyClaimed ? "text-zinc-600 line-through" : isNext ? "text-emerald-400" : "text-zinc-500"
                           )}>
                             {r.name}
                           </span>
                           {canClaim ? (
                             <span className="text-[10px] text-amber-900 font-bold bg-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce mt-0.5 cursor-pointer" onClick={() => setClaimModal({ reward: r })}>Canjear</span>
                           ) : (
                             <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800/80 tracking-widest">{r.pointsRequired} pts</span>
                           )}
                        </div>
                     </div>

                     {/* Connecting Line */}
                     {i < timelineRewards.length - 1 && (
                       <div className="w-16 sm:w-24 h-3 sm:h-4 bg-zinc-950 rounded-full shadow-inner border border-zinc-900 relative -mx-4 z-0 overflow-hidden">
                          <div
                            className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 transition-all duration-1000 ease-out"
                            style={{ width: `${segmentFill > 0 ? Math.max(5, segmentFill) : 0}%` }}
                          >
                             {segmentFill > 0 && <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/40 animate-pulse" />}
                          </div>
                       </div>
                     )}
                  </div>
               )
            })}
          </div>
        </div>
      </div>

      {/* ── Individual Reward Timeline + History ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Cards with individual timeline */}
        <div className="lg:col-span-2 card-base p-6">
          <h3 className="panel-title flex items-center gap-2 mb-1"><Users size={18} className="text-indigo-400"/> Ranking de Estudiantes</h3>
          <p className="panel-subtitle mb-4">Puntos individuales · Haz clic en un premio dorado para canjearlo.</p>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {students.sort((a: Student, b: Student) => b.points - a.points).map((s: Student, i: number) => {
              const indRewards = individualRewards.sort((a: Reward, b: Reward) => a.pointsRequired - b.pointsRequired)
              const nextInd = indRewards.find((r: Reward) => r.pointsRequired > s.points)
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900/40 border border-transparent hover:border-zinc-800/50 transition-all group">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    i === 0 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                    i === 1 ? "bg-zinc-300/20 text-zinc-300 border border-zinc-300/30" :
                    i === 2 ? "bg-amber-700/20 text-amber-600 border border-amber-700/30" : "text-zinc-600 border border-zinc-800"
                  )}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{s.name}</p>
                    {nextInd && <p className="text-[10px] text-zinc-500 truncate">Próximo: {nextInd.icon} {nextInd.name} ({nextInd.pointsRequired} pts)</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {indRewards.slice(0, 6).map((r: Reward) => {
                      const reached = s.points >= r.pointsRequired
                      const isNextR = nextInd?.id === r.id
                      return (
                        <button
                          key={r.id}
                          title={`${r.name} (${r.pointsRequired} pts)`}
                          onClick={() => reached && setClaimModal({ reward: r, student: s })}
                          className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm border transition-all",
                            reached ? "bg-amber-400 border-amber-200 text-amber-900 shadow-[0_0_10px_rgba(251,191,36,0.4)] hover:scale-125 cursor-pointer" :
                            isNextR ? "bg-zinc-900 border-emerald-500/50 text-zinc-500 animate-pulse" :
                            "bg-zinc-900 border-zinc-800 text-zinc-600 opacity-40 cursor-default grayscale"
                          )}
                        >
                          {r.icon}
                        </button>
                      )
                    })}
                    <div className="ml-2 text-lg font-black text-white whitespace-nowrap">{s.points}<span className="text-xs font-medium text-zinc-500 ml-0.5">pts</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Latest Timeline ── */}
        <div className="card-base p-6 flex flex-col">
          <h3 className="panel-title flex items-center gap-2"><TrendingUp size={18} className="text-rose-400"/> Historial Reciente</h3>
          <p className="panel-subtitle">Últimas acciones del curso.</p>
          <div className="flex-1 space-y-2 mt-3 overflow-y-auto max-h-[360px] pr-1">
            {logs.length === 0 && <div className="text-zinc-500 text-sm text-center py-8">No se han registrado acciones.</div>}
            {logs.slice(0, 15).map((l: Log) => {
              const stName = l.student?.name?.split(' ')[0]
              return (
                <div key={l.id} className="flex items-start gap-3 p-2 group">
                  <div className="mt-1.5 flex-shrink-0"><div className={cn("w-2 h-2 rounded-full ring-4 ring-zinc-950 group-hover:ring-zinc-900 transition-colors", l.points > 0 ? "bg-emerald-500" : l.points === 0 ? "bg-blue-500" : "bg-rose-500")} /></div>
                  <p className="text-xs text-zinc-300 break-words flex-1">
                    {stName ? <span className="font-semibold text-white">{stName}</span> : <span className="font-semibold text-blue-300">Clase</span>}
                    {" "}<span className={cn("font-medium", l.points > 0 ? "text-emerald-400" : l.points === 0 ? "text-blue-400" : "text-rose-400")}>{l.points > 0 ? '+' : ''}{l.points} pts</span>
                    <span className="text-zinc-500"> por </span>{l.reason}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Award Modal ── */}
      <Modal open={awardModal} onClose={() => setAwardModal(false)} title="Otorgar Puntos" lg>
        <div className="space-y-4">
          <div>
            <label className="label">Destinatario</label>
            <select className="select" value={awardTarget} onChange={e => setAwardTarget(e.target.value)}>
              <option value="class">Toda la clase</option>
              <optgroup label="Estudiantes Individuales">
                {students.map((s: Student) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
            </select>
          </div>
          
          <div>
            <label className="label mb-2">Acción</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
              {activeActions.filter((a: Action) => awardTarget === 'class' ? a.affectsClass : a.affectsStudent).map((a: Action) => {
                const col = ACTION_COLORS[a.category] || { bg: '#1e3a8a', text: '#bfdbfe' }
                return (
                  <button key={a.id} onClick={() => awardPoints(a.points, a.name, a.id)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all text-left group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md font-bold text-lg" style={{ background: `${col.bg}40`, color: col.text, border: `1px solid ${col.bg}` }}>
                      {a.points > 0 ? '+' : ''}{a.points}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-white">{a.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Claim Reward Modal ── */}
      <Modal open={!!claimModal} onClose={() => setClaimModal(null)} title={claimModal?.student ? `Premio Individual` : `Premio Grupal`}>
        <div className="text-center py-6 space-y-6">
          <div className="w-24 h-24 rounded-full bg-amber-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] border-4 border-amber-200 animate-pulse">
             <span className="text-5xl">{claimModal?.reward.icon}</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{claimModal?.reward.name}</h3>
            {claimModal?.student && <p className="text-indigo-300 font-semibold mt-1">Para: {claimModal.student.name}</p>}
            <p className="text-zinc-400 mt-1">{claimModal?.student ? `${claimModal.student.points} pts personales` : `Nivel de ${claimModal?.reward.pointsRequired} pts alcanzado`}</p>
          </div>
          {claimModal?.reward.description && <p className="text-zinc-400 text-sm italic">{claimModal.reward.description}</p>}
          <div className="bg-emerald-900/20 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl text-sm font-medium">
            {claimModal?.student 
              ? `Se registrará que ${claimModal.student.name.split(' ')[0]} canjeó este premio. Sus puntos individuales NO se descontarán.`
              : `Se registrará que la clase entera canjeó este premio. Los puntos de clase NO se descontarán.`
            }
          </div>
          <div className="flex gap-3 justify-center pt-4">
            <button className="btn btn-secondary px-6" onClick={() => setClaimModal(null)}>Cancelar</button>
            <button className="btn bg-amber-500 hover:bg-amber-400 text-amber-950 px-8" onClick={claimReward}>
              ¡Confirmar Canje!
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CURSOS SECTION
   ══════════════════════════════════════════════════════════════════ */
function CursosSection({ courses, reload, showToast }: { courses: Course[]; reload: () => void; showToast: (m: string, ok?: boolean) => void }) {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState({ name: '', level: 'Secondary 2', parallel: 'A', plant: '' })

  const openNew = () => { setForm({ name: '', level: 'Secondary 2', parallel: 'A', plant: '' }); setEditing(null); setModal(true) }
  const openEdit = (c: Course) => { setForm({ name: c.name, level: c.level, parallel: c.parallel, plant: c.plant }); setEditing(c); setModal(true) }

  const save = async () => {
    const url = editing ? `/api/cursos/${editing.id}` : '/api/cursos'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { showToast(editing ? 'Curso actualizado' : 'Curso creado'); setModal(false); reload() }
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar este curso y todos sus estudiantes?')) return
    await fetch(`/api/cursos/${id}`, { method: 'DELETE' })
    showToast('Curso eliminado'); reload()
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Cursos</h2>
          <p className="text-zinc-400 text-sm">Administra los cursos, plantas y niveles.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} className="mr-1"/> Nuevo Curso</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <div key={c.id} className="card-base p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{c.name}</h3>
                <span className="text-lg font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{c.classPoints} pts</span>
              </div>
              <div className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wider">{c.level} — Par. {c.parallel}</div>
              {c.plant && <div className="text-xs text-emerald-400 mt-2">🌱 Planta: {c.plant}</div>}
              <div className="mt-4 text-sm text-zinc-400 flex items-center gap-1"><Users size={14}/> {c._count?.students ?? 0} estudiantes</div>
            </div>
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-800/50">
              <button className="btn btn-secondary flex-1" onClick={() => openEdit(c)}>Editar</button>
              <button className="btn btn-danger" onClick={() => del(c.id)}><X size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar curso' : 'Nuevo curso'}>
        <div className="space-y-3">
          <div><label className="label">Nombre (ej. S2A)</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Nivel</label><input className="input" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} /></div>
          <div><label className="label">Paralelo</label><input className="input" value={form.parallel} onChange={e => setForm(p => ({ ...p, parallel: e.target.value }))} /></div>
          <div><label className="label">Planta del proyecto</label><input className="input" value={form.plant} onChange={e => setForm(p => ({ ...p, plant: e.target.value }))} /></div>
        </div>
        <div className="modal-footer mt-6">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Guardar' : 'Crear Curso'}</button>
        </div>
      </Modal>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   ESTUDIANTES SECTION + EXCEL IMPORT
   ══════════════════════════════════════════════════════════════════ */
function EstudiantesSection({ students, currentCourse, reload, reloadAll, showToast }: any) {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState({ name: '', code: '', email: '' })
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openNew = () => { setForm({ name: '', code: '', email: '' }); setEditing(null); setModal(true) }
  const openEdit = (s: Student) => { setForm({ name: s.name, code: s.code, email: s.email || '' }); setEditing(s); setModal(true) }

  const save = async () => {
    if (!form.name) return
    const url = editing ? `/api/estudiantes/${editing.id}` : '/api/estudiantes'
    const method = editing ? 'PUT' : 'POST'
    const body = editing ? form : { ...form, courseId: currentCourse }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { showToast(editing ? 'Actualizado' : 'Creado'); setModal(false); reload(); reloadAll() }
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar estudiante?')) return
    await fetch(`/api/estudiantes/${id}`, { method: 'DELETE' }); showToast('Eliminado'); reload(); reloadAll()
  }

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      showToast('Analizando Excel...', true)
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      
      const parsed = jsonData.map((row: any) => ({
        code: row['CÓDIGO']?.toString() || row['No']?.toString() || '',
        name: row['NOMBRE'] || row['Nombre'] || '',
        email: row['CORREO'] || row['Correo'] || ''
      })).filter(s => s.name)

      if (parsed.length === 0) throw new Error("No se encontraron columnas de NOMBRE válidas")

      const res = await fetch('/api/estudiantes/import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: currentCourse, students: parsed })
      })

      if (res.ok) {
        const body = await res.json()
        showToast(`${body.count} estudiantes importados exitosamente.`)
        reload()
        reloadAll()
      } else {
        throw new Error(await res.text())
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`, false)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const filtered = students.filter((s: Student) => !search || s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Directorio de Alumnos</h2>
          <p className="text-zinc-400 text-sm">{students.length} estudiantes en el curso seleccionado.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input className="input pl-9 w-[200px]" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} title="Importar Excel">
            <Upload size={16} className="mr-2" /> Importar Excel
          </button>
          <input type="file" ref={fileInputRef} accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} />
          <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} /> </button>
        </div>
      </div>

      <div className="card-base border-t-0 rounded-none sm:rounded-xl sm:border-t">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900/50 text-zinc-400 uppercase text-xs font-semibold tracking-wider border-b border-zinc-800 text-left">
              <tr>
                <th className="px-6 py-4">Estudiante</th>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4 text-right">Puntos</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((s: Student) => (
                <tr key={s.id} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-100">{s.name}</div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{s.code || '-'}</td>
                  <td className="px-6 py-4 text-zinc-400">{s.email || '-'}</td>
                  <td className="px-6 py-4 text-right">
                     <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-zinc-800 text-zinc-200 font-bold border border-zinc-700">{s.points}</span>
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-blue-400 hover:text-blue-300 font-medium text-xs mr-3" onClick={() => openEdit(s)}>Editar</button>
                    <button className="text-red-400 hover:text-red-300 font-medium text-xs" onClick={() => del(s.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No se encontraron estudiantes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar alumno' : 'Nuevo alumno'}>
        <div className="space-y-3">
          <div><label className="label">Nombre completo</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Código</label><input className="input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} /></div>
          <div><label className="label">Correo</label><input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
        </div>
        <div className="modal-footer mt-6">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Guardar' : 'Crear'}</button>
        </div>
      </Modal>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   GRUPOS SECTION
   ══════════════════════════════════════════════════════════════════ */
function GruposSection({ groups, students, currentCourse, reload, showToast }: any) {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)
  const [form, setForm] = useState({ name: '', memberIds: [] as string[] })

  const openNew = () => { setForm({ name: '', memberIds: [] }); setEditing(null); setModal(true) }
  const openEdit = (g: Group) => { setForm({ name: g.name, memberIds: g.members.map((m: any) => m.studentId) }); setEditing(g); setModal(true) }

  const save = async () => {
    if (!form.name) return
    const url = editing ? `/api/grupos/${editing.id}` : '/api/grupos'
    const method = editing ? 'PUT' : 'POST'
    const body = { ...form, courseId: currentCourse }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { showToast(editing ? 'Grupo actualizado' : 'Grupo creado'); setModal(false); reload() }
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar grupo?')) return
    await fetch(`/api/grupos/${id}`, { method: 'DELETE' }); showToast('Eliminado'); reload()
  }

  const toggleMember = (studentId: string) => {
    setForm(p => ({
      ...p,
      memberIds: p.memberIds.includes(studentId)
        ? p.memberIds.filter(id => id !== studentId)
        : [...p.memberIds, studentId]
    }))
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Grupos de Trabajo</h2>
          <p className="text-zinc-400 text-sm">Gestiona los equipos en el curso seleccionado.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} className="mr-1"/> Nuevo Grupo</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {groups.map((g: Group) => (
           <div key={g.id} className="card-base p-5 flex flex-col justify-between">
             <div>
               <h3 className="text-lg font-bold text-white mb-3">{g.name}</h3>
               <div className="space-y-1 mt-2">
                 {g.members.map((m: any) => (
                   <div key={m.id} className="text-sm text-zinc-300 flex justify-between items-center bg-zinc-900/50 px-2 py-1 rounded">
                     <span>{m.student.name}</span>
                     <span className="text-xs font-mono text-zinc-500">{m.student.points} pts</span>
                   </div>
                 ))}
                 {g.members.length === 0 && <div className="text-zinc-500 text-sm italic">Sin miembros</div>}
               </div>
             </div>
             <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-800/50">
                <button className="btn btn-secondary flex-1" onClick={() => openEdit(g)}>Editar</button>
                <button className="btn btn-danger" onClick={() => del(g.id)}><X size={16}/></button>
             </div>
           </div>
         ))}
         {groups.length === 0 && <div className="col-span-full text-center py-12 text-zinc-500">No hay grupos creados en este curso.</div>}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Grupo' : 'Nuevo Grupo'}>
        <div className="space-y-4">
          <div><label className="label">Nombre del Grupo</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          
          <div>
            <label className="label">Seleccionar Miembros</label>
            <div className="max-h-[250px] overflow-y-auto space-y-1 border border-zinc-800 rounded-md p-2 bg-zinc-900/20">
              {students.map((s: Student) => (
                <label key={s.id} className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800/50 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-zinc-950"
                    checked={form.memberIds.includes(s.id)} onChange={() => toggleMember(s.id)} />
                  <span className="text-sm text-zinc-300">{s.name}</span>
                </label>
              ))}
              {students.length === 0 && <div className="text-sm text-zinc-500 p-2">No hay estudiantes en el curso.</div>}
            </div>
          </div>
        </div>
        <div className="modal-footer mt-6">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Guardar' : 'Crear Grupo'}</button>
        </div>
      </Modal>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   ACCIONES SECTION
   ══════════════════════════════════════════════════════════════════ */
function AccionesSection({ actions, reload, showToast }: { actions: Action[]; reload: () => void; showToast: (m: string, ok?: boolean) => void }) {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Action | null>(null)
  const [form, setForm] = useState({ name: '', points: 10, category: 'blue', affectsClass: false, affectsStudent: true, isActive: true })

  const openNew = () => { setForm({ name: '', points: 10, category: 'blue', affectsClass: false, affectsStudent: true, isActive: true }); setEditing(null); setModal(true) }
  const openEdit = (a: Action) => { setForm({ ...a }); setEditing(a); setModal(true) }

  const save = async () => {
    if (!form.name) return
    const url = editing ? `/api/acciones/${editing.id}` : '/api/acciones'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { showToast(editing ? 'Acción actualizada' : 'Acción creada'); setModal(false); reload() }
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar acción permanentemente?')) return
    await fetch(`/api/acciones/${id}`, { method: 'DELETE' }); showToast('Eliminada'); reload()
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Catálogo de Acciones</h2>
          <p className="text-zinc-400 text-sm">Configura los comportamientos y sus puntajes.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} className="mr-1"/> Nueva Acción</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map(a => {
          const col = ACTION_COLORS[a.category] || { bg: '#1e3a8a', text: '#bfdbfe' }
          return (
            <div key={a.id} className={cn("card-base p-5 flex flex-col justify-between transition-opacity", !a.isActive && "opacity-60")}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg" style={{ background: `${col.bg}40`, color: col.text, border: `1px solid ${col.bg}` }}>
                    {a.points > 0 ? '+' : ''}{a.points}
                  </div>
                  {!a.isActive && <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Inactiva</span>}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 leading-tight">{a.name}</h3>
                <div className="flex gap-2 text-xs mt-3">
                  {a.affectsClass && <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">Clase</span>}
                  {a.affectsStudent && <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">Estudiante</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-zinc-800/50">
                <button className="btn btn-secondary flex-1" onClick={() => openEdit(a)}>Editar</button>
                <button className="btn btn-danger" onClick={() => del(a.id)}><X size={16}/></button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Acción' : 'Nueva Acción'}>
        <div className="space-y-4">
          <div><label className="label">Nombre descriptivo</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Puntos</label><input className="input" type="number" value={form.points} onChange={e => setForm(p => ({ ...p, points: parseInt(e.target.value) || 0 }))} /></div>
            <div>
              <label className="label">Categoría/Color</label>
              <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.affectsClass} onChange={e => setForm(p => ({ ...p, affectsClass: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900" />
              <span className="text-sm text-zinc-300">Aplica a toda la clase</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.affectsStudent} onChange={e => setForm(p => ({ ...p, affectsStudent: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900" />
              <span className="text-sm text-zinc-300">Aplica a estudiante individual</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900" />
              <span className="text-sm text-zinc-300">Acción Activa (Visible en app)</span>
            </label>
          </div>
        </div>
        <div className="modal-footer mt-6">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Guardar' : 'Crear Acción'}</button>
        </div>
      </Modal>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   RECOMPENSAS SECTION
   ══════════════════════════════════════════════════════════════════ */
function RecompensasSection({ rewards, reload, showToast }: { rewards: Reward[]; reload: () => void; showToast: (m: string, ok?: boolean) => void }) {
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Reward | null>(null)
  const [form, setForm] = useState({ name: '', description: '', icon: '★', pointsRequired: 100, type: 'privilege', isGlobal: true, isActive: true })

  const openNew = () => { setForm({ name: '', description: '', icon: '★', pointsRequired: 100, type: 'privilege', isGlobal: true, isActive: true }); setEditing(null); setModal(true) }
  const openEdit = (r: Reward) => { setForm({ ...r }); setEditing(r); setModal(true) }

  const save = async () => {
    if (!form.name) return
    const url = editing ? `/api/recompensas/${editing.id}` : '/api/recompensas'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { showToast(editing ? 'Recompensa actualizada' : 'Recompensa creada'); setModal(false); reload() }
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar recompensa permanentemente?')) return
    await fetch(`/api/recompensas/${id}`, { method: 'DELETE' }); showToast('Eliminada'); reload()
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Tienda de Recompensas</h2>
          <p className="text-zinc-400 text-sm">Gestiona los premios y privilegios canjeables.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} className="mr-1"/> Nueva Recompensa</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map(r => (
          <div key={r.id} className={cn("card-base p-5 flex flex-col justify-between transition-opacity", !r.isActive && "opacity-60")}>
            <div>
               <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xl">
                    {r.icon}
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-zinc-800 text-zinc-300">{r.pointsRequired} pts</span>
               </div>
               <h3 className="text-lg font-semibold text-white mb-1">{r.name}</h3>
               <p className="text-sm text-zinc-400 line-clamp-2">{r.description || 'Sin descripción'}</p>
               
               <div className="flex gap-2 text-xs mt-4">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">{r.type === 'physical' ? 'Física' : r.type === 'digital' ? 'Digital' : 'Privilegio'}</span>
                  {r.isGlobal ? <span className="px-2 py-0.5 rounded bg-blue-900/30 text-blue-300">Global</span> : <span className="px-2 py-0.5 rounded bg-rose-900/30 text-rose-300">Personal</span>}
               </div>
            </div>
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-zinc-800/50">
              <button className="btn btn-secondary flex-1" onClick={() => openEdit(r)}>Editar</button>
              <button className="btn btn-danger" onClick={() => del(r.id)}><X size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Recompensa' : 'Nueva Recompensa'}>
        <div className="space-y-4">
          <div><label className="label">Nombre / Título</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Descripción</label><input className="input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Costo en Puntos</label><input className="input" type="number" value={form.pointsRequired} onChange={e => setForm(p => ({ ...p, pointsRequired: parseInt(e.target.value) || 0 }))} /></div>
            <div>
              <label className="label">Icono</label>
              <select className="select" value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}>
                {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de Premio</label>
              <select className="select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="privilege">Privilegio</option>
                <option value="physical">Físico</option>
                <option value="digital">Digital (Medalla)</option>
              </select>
            </div>
            <div>
              <label className="label">Aplica a</label>
              <select className="select" value={form.isGlobal ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isGlobal: e.target.value === 'true' }))}>
                <option value="true">Clase entera</option>
                <option value="false">Estudiante Individual</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900" />
              <span className="text-sm text-zinc-300">Activa (Disponible para canje)</span>
            </label>
          </div>
        </div>
        <div className="modal-footer mt-6">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Guardar' : 'Crear Premio'}</button>
        </div>
      </Modal>
    </div>
  )
}
