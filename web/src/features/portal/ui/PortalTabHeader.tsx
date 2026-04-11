'use client'
import { LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { NotificationBell } from '@/components/shared/NotificationBell'
import type { StudentData } from '../domain/types'

interface Props {
  student: StudentData
  onLogout: () => void
}

export function PortalTabHeader({ student, onLogout }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-30">
      {/* Left: avatar + name */}
      <div className="flex items-center gap-2.5">
        <Avatar name={student.name} src={student.avatarUrl ?? undefined} size="sm" className="w-8 h-8 border border-amber-500/20" />
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
