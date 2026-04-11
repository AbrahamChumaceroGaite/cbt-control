import { Bell } from 'lucide-react'
import { Skeleton } from '@/components/ui'
import { timeAgo }  from '@/lib/utils'
import type { NotificationItem } from '../../domain/types'

interface Props {
  notifications: NotificationItem[]
  loading:       boolean
}

export function DrawerNotificationsTab({ notifications, loading }: Props) {
  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-zinc-700">
        <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
          <Bell className="w-5 h-5 opacity-40" />
        </div>
        <span className="text-xs text-zinc-600">No notifications</span>
      </div>
    )
  }

  return (
    <ul>
      {notifications.map(n => (
        <li key={n.id} className={`flex gap-3 px-4 py-3 border-b border-zinc-800/40 last:border-0 ${!n.isRead ? 'bg-zinc-900/25' : ''}`}>
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-amber-400' : 'bg-zinc-800'}`} />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-2">
              <p className={`text-xs font-semibold ${n.isRead ? 'text-zinc-400' : 'text-zinc-100'}`}>{n.title}</p>
              <span className="text-[10px] text-zinc-600 flex-shrink-0">{timeAgo(n.createdAt)}</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{n.body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
