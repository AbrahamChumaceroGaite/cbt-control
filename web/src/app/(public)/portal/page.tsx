'use client'
import { Gift, ClipboardList, History, Landmark, Gamepad2, LogOut, Coins } from 'lucide-react'
import { usePortal }         from '@/features/portal/application/usePortal'
import { FloatingNav }       from '@/components/shared/FloatingNav'
import { ConfirmDialog }     from '@/components/shared/ConfirmDialog'
import { NotificationBell }  from '@/components/shared/NotificationBell'
import { Avatar }            from '@/components/ui'
import { PortalSkeleton }    from '@/features/portal/ui/PortalSkeleton'
import { PerfilTab }         from '@/features/portal/ui/PerfilTab'
import { RecompensasTab }    from '@/features/portal/ui/RecompensasTab'
import { SolicitudesTab }    from '@/features/portal/ui/SolicitudesTab'
import { BankTab }           from '@/features/portal/ui/BankTab'
import { GamesSection }      from '@/features/games/ui/GamesSection'
import type { PortalTab }    from '@/features/portal/domain/types'

const NAV_TABS: { id: PortalTab; icon: React.ElementType; label: string }[] = [
  { id: 'perfil',      icon: History,      label: 'Inicio'      },
  { id: 'recompensas', icon: Gift,         label: 'Premios'     },
  { id: 'solicitudes', icon: ClipboardList, label: 'Solicitudes' },
  { id: 'bank',        icon: Landmark,     label: 'Bank'        },
  { id: 'games',       icon: Gamepad2,     label: 'Games'       },
]

export default function PortalPage() {
  const {
    student, rewards, tab, loading, requesting, logoutModalOpen,
    setTab, setLogoutModalOpen,
    onStudentUpdate, onCoinsUpdate,
    requestReward, logout, reloadStudent,
  } = usePortal()

  if (loading) return <PortalSkeleton />
  if (!student) return null

  const solicitudesCount = student.redemptionRequests.filter(r => r.status === 'pending').length
  const onLogout = () => setLogoutModalOpen(true)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      <main className="relative z-10">
        {tab === 'perfil'      && <PerfilTab      student={student} rewards={rewards} onStudentUpdate={onStudentUpdate} onLogout={onLogout} />}
        {tab === 'recompensas' && <RecompensasTab student={student} rewards={rewards} requesting={requesting} onRequest={requestReward} onLogout={onLogout} />}
        {tab === 'solicitudes' && <SolicitudesTab student={student} requests={student.redemptionRequests} onLogout={onLogout} onReload={reloadStudent} />}
        {tab === 'bank'        && <BankTab        student={student} onLogout={onLogout} onCoinsUpdate={onCoinsUpdate} />}
        {tab === 'games'       && (
          <div className="pb-24">
            <header className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Avatar name={student.name} size="sm" className="rounded-lg" />
                <div>
                  <div className="text-sm font-semibold text-zinc-100 leading-none">{student.name}</div>
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-0.5 font-medium">
                    <Coins className="w-3 h-3" />
                    {student.coins}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <NotificationBell />
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </header>
            <div className="px-4 pt-4">
              <GamesSection />
            </div>
          </div>
        )}
      </main>

      <FloatingNav
        tabs={NAV_TABS.map(t => ({ ...t, badge: t.id === 'solicitudes' ? solicitudesCount : undefined }))}
        active={tab}
        onTabChange={setTab}
      />

      <ConfirmDialog
        open={logoutModalOpen}
        onConfirm={logout}
        onCancel={() => setLogoutModalOpen(false)}
        title="Sign out?"
        message="Your session will be closed on this device."
        confirmText="Sign out"
        variant="red"
        icon={
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-400" />
          </div>
        }
      />
    </div>
  )
}
