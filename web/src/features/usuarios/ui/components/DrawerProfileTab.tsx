import { BellDot, Bell, GraduationCap, Calendar, Hash } from 'lucide-react'
import { formatDate }         from '@/lib/utils'
import type { UserViewModel } from '../../domain/types'

export function DrawerProfileTab({ user }: { user: UserViewModel }) {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-3">
        {([
          { icon: Hash,     label: 'Code',       value: user.code },
          { icon: Calendar, label: 'Registered',  value: formatDate(user.createdAt) },
        ] as const).map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 py-2.5 border-b border-zinc-800/50">
            <Icon className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
            <span className="text-xs text-zinc-500 w-24 flex-shrink-0">{label}</span>
            <span className="text-xs text-zinc-300 font-medium">{value}</span>
          </div>
        ))}
        {user.student && (
          <div className="flex items-center gap-3 py-2.5 border-b border-zinc-800/50">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
            <span className="text-xs text-zinc-500 w-24 flex-shrink-0">Student</span>
            <div className="text-xs text-zinc-300">
              <div className="font-medium">{user.student.name}</div>
              {user.student.course && <div className="text-zinc-500">{user.student.course.name}</div>}
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-3 border ${user.hasPush ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-zinc-900/40 border-zinc-800'}`}>
          <div className="flex items-center gap-2 mb-1">
            {user.hasPush ? <BellDot className="w-3.5 h-3.5 text-emerald-400" /> : <Bell className="w-3.5 h-3.5 text-zinc-600" />}
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Push</span>
          </div>
          <p className={`text-lg font-black ${user.hasPush ? 'text-emerald-400' : 'text-zinc-600'}`}>{user.hasPush ? 'Active' : 'Inactive'}</p>
          <p className="text-[10px] text-zinc-600">{user.pushSubscriptionCount} device{user.pushSubscriptionCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="rounded-xl p-3 border bg-zinc-900/40 border-zinc-800">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Notif.</span>
          </div>
          <p className="text-lg font-black text-zinc-300">{user.notificationCount}</p>
          <p className="text-[10px] text-zinc-600">in history</p>
        </div>
      </div>
    </div>
  )
}
