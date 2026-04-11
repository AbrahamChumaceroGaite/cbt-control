import { Bell, BellOff } from 'lucide-react'
import type { UserViewModel } from '../domain/types'

interface Props {
  user:    UserViewModel
  onClick: () => void
}

export function UserCard({ user, onClick }: Props) {
  const isAdmin   = user.role === 'admin'
  const aura      = isAdmin
    ? 'border-purple-500/25 hover:border-purple-500/50 hover:shadow-purple-500/10'
    : 'border-blue-500/20 hover:border-blue-500/40 hover:shadow-blue-500/8'
  const avatarCls = isAdmin
    ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
    : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
  const roleCls   = isAdmin ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'

  return (
    <button
      onClick={onClick}
      className={`group relative text-left w-full bg-zinc-900/60 border rounded-xl p-4 hover:bg-zinc-900/90 hover:shadow-lg transition-all duration-200 ${aura}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base font-black flex-shrink-0 ${avatarCls}`}>
          {user.initial}
        </div>
        <div className="min-w-0 flex-1 pr-5">
          <p className="text-sm font-semibold text-zinc-100 truncate leading-tight">{user.displayName}</p>
          <p className="text-[11px] text-zinc-500 font-mono truncate">{user.code}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${roleCls}`}>
              {isAdmin ? 'Admin' : 'Student'}
            </span>
            <span className={`text-[10px] font-medium ${user.isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>
              {user.isActive ? '● Active' : '● Inactive'}
            </span>
            {user.student?.course && (
              <span className="text-[10px] text-zinc-600">{user.student.course.name}</span>
            )}
          </div>
        </div>
      </div>
      <div className="absolute top-3 right-3">
        {user.hasPush
          ? <Bell    className="w-3 h-3 text-emerald-400" />
          : <BellOff className="w-3 h-3 text-zinc-700"   />
        }
      </div>
    </button>
  )
}
