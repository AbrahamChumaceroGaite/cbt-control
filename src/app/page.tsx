'use client'
import { useEffect, useState, useCallback } from 'react'
import { Home, BookType, Users, Network, Zap, Gift, Bell, UserCog, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Course, Student, Action, Reward, Log, Group, AppTab } from '@/lib/types'
import { Toast }              from './_components/Toast'
import { AulaSection }        from './_components/AulaSection'
import { CursosSection }      from './_components/CursosSection'
import { EstudiantesSection } from './_components/EstudiantesSection'
import { GruposSection }      from './_components/GruposSection'
import { AccionesSection }    from './_components/AccionesSection'
import { RecompensasSection } from './_components/RecompensasSection'
import { SolicitudesSection } from './_components/SolicitudesSection'
import { UsuariosSection }    from './_components/UsuariosSection'

const TABS: { id: AppTab; label: string; icon: React.ElementType }[] = [
  { id: 'aula',         label: 'Dashboard',   icon: Home     },
  { id: 'cursos',       label: 'Cursos',      icon: BookType },
  { id: 'estudiantes',  label: 'Alumnos',     icon: Users    },
  { id: 'grupos',       label: 'Grupos',      icon: Network  },
  { id: 'acciones',     label: 'Acciones',    icon: Zap      },
  { id: 'recompensas',  label: 'Premios',     icon: Gift     },
  { id: 'solicitudes',  label: 'Solicitudes', icon: Bell     },
  { id: 'usuarios',     label: 'Usuarios',    icon: UserCog  },
]

export default function App() {
  const [tab, setTab]                       = useState<AppTab>('aula')
  const [courses, setCourses]               = useState<Course[]>([])
  const [students, setStudents]             = useState<Student[]>([])
  const [actions, setActions]               = useState<Action[]>([])
  const [rewards, setRewards]               = useState<Reward[]>([])
  const [groups, setGroups]                 = useState<Group[]>([])
  const [logs, setLogs]                     = useState<Log[]>([])
  const [currentCourse, setCurrentCourse]   = useState('')
  const [pendingSolicitudes, setPendingSolicitudes] = useState(0)
  const [adminName, setAdminName]           = useState('CBT')
  const [toast, setToast]                   = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok }); setTimeout(() => setToast(null), 3000)
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d?.fullName) setAdminName(d.fullName)
      else if (d?.code) setAdminName(d.code)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/solicitudes').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setPendingSolicitudes(data.filter((s: any) => s.status === 'pending').length)
    }).catch(() => {})
  }, [tab])

  const loadCourse = useCallback(async (id: string) => {
    const [s, detail, g] = await Promise.all([
      fetch(`/api/estudiantes?courseId=${id}`).then(r => r.json()).catch(() => []),
      fetch(`/api/cursos/${id}`).then(r => r.json()).catch(() => ({})),
      fetch(`/api/grupos?courseId=${id}`).then(r => r.json()).catch(() => []),
    ])
    setStudents(Array.isArray(s) ? s : [])
    setLogs(Array.isArray(detail?.coinLogs) ? detail.coinLogs : [])
    setGroups(Array.isArray(g) ? g : [])
  }, [])

  const loadAll = useCallback(async () => {
    const [c, a, r] = await Promise.all([
      fetch('/api/cursos').then(r => r.json()).catch(() => []),
      fetch('/api/acciones').then(r => r.json()).catch(() => []),
      fetch('/api/recompensas').then(r => r.json()).catch(() => []),
    ])
    setCourses(Array.isArray(c) ? c : [])
    setActions(Array.isArray(a) ? a : [])
    setRewards(Array.isArray(r) ? r : [])
    if (Array.isArray(c) && c.length && !currentCourse) {
      setCurrentCourse(c[0].id)
      loadCourse(c[0].id)
    }
  }, [currentCourse, loadCourse])

  useEffect(() => { loadAll() }, [loadAll])
  useEffect(() => { if (currentCourse) loadCourse(currentCourse) }, [currentCourse, loadCourse])

  const switchTab = useCallback((t: AppTab) => {
    setTab(t)
    if (t === 'aula' && currentCourse) loadCourse(currentCourse)
  }, [currentCourse, loadCourse])

  const course = courses.find(c => c.id === currentCourse)

  return (
    <div className="min-h-screen bg-zinc-950 page-wrapper relative overflow-x-hidden">
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Header */}
      <header className="fixed top-3 left-3 right-3 z-30 rounded-2xl border border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md shadow-xl shadow-black/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <span className="text-amber-400 text-xs font-black">{adminName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-100 leading-none">{adminName}</div>
            <div className="text-[10px] text-zinc-600 mt-0.5 font-medium uppercase tracking-wider">Administrador</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {courses.length > 0 && (
            <select
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-700"
              value={currentCourse} onChange={e => setCurrentCourse(e.target.value)}
            >
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <button onClick={logout} title="Cerrar sesión" className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-20 pb-6 px-6 mx-auto max-w-[1400px]">
        {tab === 'aula'        && <AulaSection        course={course} students={students} actions={actions} rewards={rewards} logs={logs} reload={() => loadCourse(currentCourse)} showToast={showToast} />}
        {tab === 'cursos'      && <CursosSection      courses={courses} reload={loadAll} showToast={showToast} />}
        {tab === 'estudiantes' && <EstudiantesSection students={students} currentCourse={currentCourse} reload={() => loadCourse(currentCourse)} reloadAll={loadAll} showToast={showToast} />}
        {tab === 'grupos'      && <GruposSection      groups={groups} students={students} currentCourse={currentCourse} reload={() => loadCourse(currentCourse)} showToast={showToast} />}
        {tab === 'acciones'    && <AccionesSection    actions={actions} reload={loadAll} showToast={showToast} />}
        {tab === 'recompensas' && <RecompensasSection rewards={rewards} reload={loadAll} showToast={showToast} />}
        {tab === 'solicitudes' && <SolicitudesSection showToast={showToast} onCountChange={setPendingSolicitudes} />}
        {tab === 'usuarios'    && <UsuariosSection    courses={courses} showToast={showToast} />}
      </main>

      <footer className="relative z-10 text-center py-6 text-zinc-700 text-xs">
        Ing. Abraham CG &mdash; 2026 · All rights reserved
      </footer>

      {/* Bottom nav */}
      <nav className="floating-nav">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => switchTab(t.id)} className={cn('nav-item', tab === t.id && 'active')}>
              <div className="relative inline-flex">
                <Icon className="nav-icon" strokeWidth={tab === t.id ? 2.5 : 2} />
                {t.id === 'solicitudes' && pendingSolicitudes > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[9px] font-black rounded-full min-w-[14px] h-3.5 px-0.5 flex items-center justify-center leading-none">
                    {pendingSolicitudes > 9 ? '9+' : pendingSolicitudes}
                  </span>
                )}
              </div>
              <span className="nav-label">{t.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
