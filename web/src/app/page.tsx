'use client'
import { useEffect, useState, useCallback } from 'react'
import { Home, BookType, Users, Network, Gift, Bell, Shield, LogOut } from 'lucide-react'
import { Toast } from '@/components/ui'
import type { CourseResponse, StudentResponse, ActionResponse, RewardResponse, CoinLogResponse, GroupResponse } from '@control-aula/shared'
import { coursesService }    from '@/services/courses.service'
import { studentsService }   from '@/services/students.service'
import { actionsService }    from '@/services/actions.service'
import { rewardsService }    from '@/services/rewards.service'
import { groupsService }     from '@/services/groups.service'
import { solicitudesService } from '@/services/solicitudes.service'
import { authService }       from '@/services/auth.service'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { NotificationBell }  from '@/features/notifications/NotificationBell'
import { AulaSection }        from '@/features/aula/AulaSection'
import { CursosSection }      from '@/features/cursos/CursosSection'
import { EstudiantesSection } from '@/features/estudiantes/EstudiantesSection'
import { GruposSection }      from '@/features/grupos/GruposSection'
import { StoreSection }       from '@/features/tienda/StoreSection'
import { SolicitudesSection } from '@/features/solicitudes/SolicitudesSection'
import { AdminSection }       from '@/features/admin/AdminSection'
import { FloatingNav }        from '@/components/shared/FloatingNav'

type AppTab = 'aula' | 'cursos' | 'estudiantes' | 'grupos' | 'tienda' | 'solicitudes' | 'admin'

const TABS: { id: AppTab; label: string; icon: React.ElementType }[] = [
  { id: 'aula',        label: 'Dashboard',   icon: Home     },
  { id: 'cursos',      label: 'Cursos',      icon: BookType },
  { id: 'estudiantes', label: 'Alumnos',     icon: Users    },
  { id: 'grupos',      label: 'Grupos',      icon: Network  },
  { id: 'tienda',      label: 'Tienda',      icon: Gift     },
  { id: 'solicitudes', label: 'Solicitudes', icon: Bell     },
  { id: 'admin',       label: 'Admin',       icon: Shield   },
]

export default function App() {
  const [tab,            setTab]            = useState<AppTab>('aula')
  const [courses,        setCourses]        = useState<CourseResponse[]>([])
  const [students,       setStudents]       = useState<StudentResponse[]>([])
  const [actions,        setActions]        = useState<ActionResponse[]>([])
  const [rewards,        setRewards]        = useState<RewardResponse[]>([])
  const [groups,         setGroups]         = useState<GroupResponse[]>([])
  const [logs,           setLogs]           = useState<CoinLogResponse[]>([])
  const [currentCourse,  setCurrentCourse]  = useState('')
  const [pendingSolicitudes, setPendingSolicitudes] = useState(0)
  const [adminName,      setAdminName]      = useState('CBT')
  const [toast,          setToast]          = useState<{ msg: string; ok: boolean } | null>(null)
  const { unsubscribeForLogout }            = usePushNotifications()

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }, [])

  async function logout() {
    await unsubscribeForLogout()
    await authService.logout()
    window.location.href = '/login'
  }

  useEffect(() => {
    authService.me().then(d => {
      if (d?.fullName) setAdminName(d.fullName)
      else if (d?.code) setAdminName(d.code)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    solicitudesService.getAll().then(data => {
      setPendingSolicitudes(data.filter(s => s.status === 'pending').length)
    }).catch(() => {})
  }, [tab])

  const loadCourse = useCallback(async (id: string) => {
    const [s, detail, g] = await Promise.all([
      studentsService.getByCourse(id).catch(() => [] as StudentResponse[]),
      coursesService.get(id).catch(() => ({} as any)),
      groupsService.getByCourse(id).catch(() => [] as GroupResponse[]),
    ])
    setStudents(s)
    setLogs(Array.isArray(detail?.coinLogs) ? detail.coinLogs : [])
    setGroups(g)
  }, [])

  const loadAll = useCallback(async () => {
    const [c, a, r] = await Promise.all([
      coursesService.getAll().catch(() => [] as CourseResponse[]),
      actionsService.getAll().catch(() => [] as ActionResponse[]),
      rewardsService.getAll().catch(() => [] as RewardResponse[]),
    ])
    setCourses(c)
    setActions(a)
    setRewards(r)
    if (c.length && !currentCourse) {
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
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

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
          <NotificationBell />
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="relative pt-20 pb-6 px-6 mx-auto max-w-[1400px]">
        {tab === 'aula'        && <AulaSection        course={course} courses={courses} currentCourse={currentCourse} onCourseChange={setCurrentCourse} students={students} actions={actions} rewards={rewards} logs={logs} reload={() => loadCourse(currentCourse)} showToast={showToast} />}
        {tab === 'cursos'      && <CursosSection      courses={courses} reload={loadAll} showToast={showToast} />}
        {tab === 'estudiantes' && <EstudiantesSection students={students} courses={courses} currentCourse={currentCourse} onCourseChange={setCurrentCourse} reload={() => loadCourse(currentCourse)} reloadAll={loadAll} showToast={showToast} />}
        {tab === 'grupos'      && <GruposSection      groups={groups} students={students} courses={courses} currentCourse={currentCourse} onCourseChange={setCurrentCourse} reload={() => loadCourse(currentCourse)} showToast={showToast} />}
        {tab === 'tienda'      && <StoreSection       actions={actions} rewards={rewards} reload={loadAll} showToast={showToast} />}
        {tab === 'solicitudes' && <SolicitudesSection showToast={showToast} onCountChange={setPendingSolicitudes} />}
        {tab === 'admin'       && <AdminSection       courses={courses} showToast={showToast} reloadAll={loadAll} />}
      </main>

      <footer className="relative z-10 text-center py-6 text-zinc-700 text-xs">
        Ing. Abraham CG &mdash; 2026 · All rights reserved
      </footer>

      <FloatingNav
        tabs={TABS.map(t => ({ ...t, badge: t.id === 'solicitudes' ? pendingSolicitudes : undefined }))}
        active={tab}
        onTabChange={switchTab}
      />
    </div>
  )
}
