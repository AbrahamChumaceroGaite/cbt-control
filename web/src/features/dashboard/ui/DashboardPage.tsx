'use client'
import { Home, BookType, Users, Network, Gift, Bell, Shield, LogOut } from 'lucide-react'
import { Avatar }               from '@/components/ui'
import { NotificationBell }     from '@/components/shared/NotificationBell'
import { FloatingNav }          from '@/components/shared/FloatingNav'
import { AulaSection }          from '@/features/aula/ui/AulaSection'
import { CursosSection }        from '@/features/cursos/ui/CursosSection'
import { EstudiantesSection }   from '@/features/estudiantes/ui/EstudiantesSection'
import { GruposSection }        from '@/features/grupos/ui/GruposSection'
import { StoreSection }         from '@/features/tienda/StoreSection'
import { SolicitudesSection }   from '@/features/solicitudes/ui/SolicitudesSection'
import { AdminSection }         from '@/features/admin/AdminSection'
import { useDashboard }         from '../application/useDashboard'
import type { AppTab }          from '../domain/types'

const TABS: { id: AppTab; label: string; icon: React.ElementType }[] = [
  { id: 'aula',        label: 'Dashboard',   icon: Home     },
  { id: 'cursos',      label: 'Cursos',      icon: BookType },
  { id: 'estudiantes', label: 'Alumnos',     icon: Users    },
  { id: 'grupos',      label: 'Grupos',      icon: Network  },
  { id: 'tienda',      label: 'Tienda',      icon: Gift     },
  { id: 'solicitudes', label: 'Solicitudes', icon: Bell     },
  { id: 'admin',       label: 'Admin',       icon: Shield   },
]

export function DashboardPage() {
  const { tab, setTab, adminName, pendingSolicitudes, setPendingSolicitudes, logout } = useDashboard()

  return (
    <div className="min-h-screen bg-zinc-950 page-wrapper relative overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      <header className="fixed top-3 left-3 right-3 z-30 rounded-2xl border border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md shadow-xl shadow-black/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={adminName} size="sm" className="rounded-lg bg-amber-500/10 border border-amber-500/20" />
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
        {tab === 'aula'        && <AulaSection />}
        {tab === 'cursos'      && <CursosSection />}
        {tab === 'estudiantes' && <EstudiantesSection />}
        {tab === 'grupos'      && <GruposSection />}
        {tab === 'tienda'      && <StoreSection />}
        {tab === 'solicitudes' && <SolicitudesSection onCountChange={setPendingSolicitudes} />}
        {tab === 'admin'       && <AdminSection />}
      </main>

      <footer className="relative z-10 text-center py-6 text-zinc-700 text-xs">
        Ing. Abraham CG &mdash; 2026 · All rights reserved
      </footer>

      <FloatingNav
        tabs={TABS.map(t => ({ ...t, badge: t.id === 'solicitudes' ? pendingSolicitudes : undefined }))}
        active={tab}
        onTabChange={setTab}
      />
    </div>
  )
}
