'use client'
import { LogOut } from 'lucide-react'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import type { StudentData } from '@/services/portal.service'

interface Props {
  student: StudentData
  onLogout: () => void
}

export function PortalTabHeader({ student, onLogout }: Props) {
  const initials = student.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-30">
      {/* Left: avatar + name */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/20 bg-zinc-800 flex-shrink-0">
          {student.avatarUrl
            ? <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-xs font-black text-amber-400" style={{ background: 'linear-gradient(135deg,#1c1400,#3d2800)' }}>{initials}</div>
          }
        </div>
        <span className="text-sm font-bold text-zinc-100 truncate max-w-[160px]">{student.name}</span>
      </div>
      {/* Right: bells + logout */}
      <div className="flex items-center gap-1.5">
        <NotificationBell />
        <button
          onClick={onLogout}
          className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  )
}
