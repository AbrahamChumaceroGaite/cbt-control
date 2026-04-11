'use client'
import { Check, X }  from 'lucide-react'
import { timeAgo }   from '@/lib/utils'
import { SEVERITY }  from '@/config/scheme'
import type { NotificationItem as TItem, Severity } from '@/hooks/useInbox'

interface Props {
  item:       TItem
  severity:   Severity
  onMarkRead: (id: string) => void
  onDelete:   (id: string) => void
}

export function NotificationItem({ item, severity, onMarkRead, onDelete }: Props) {
  const s = SEVERITY[severity]
  return (
    <li className={`group flex gap-3 px-4 py-3 border-b border-zinc-800/40 last:border-0 hover:bg-zinc-900/60 transition-colors ${!item.isRead ? `bg-zinc-900/25 ${s.border}` : ''}`}>
      <div className="flex-shrink-0 mt-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${!item.isRead ? `${s.dot} animate-pulse` : 'bg-zinc-800'}`} />
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !item.isRead && onMarkRead(item.id)}>
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-tight ${item.isRead ? 'text-zinc-400' : 'text-zinc-100'}`}>{item.title}</p>
          <span className="text-[10px] text-zinc-600 flex-shrink-0">{timeAgo(item.createdAt)}</span>
        </div>
        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{item.body}</p>
      </div>
      <div className="flex-shrink-0 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!item.isRead && (
          <button onClick={() => onMarkRead(item.id)} title="Leída" className="p-1 text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors">
            <Check className="w-3 h-3" />
          </button>
        )}
        <button onClick={() => onDelete(item.id)} title="Eliminar" className="p-1 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>
    </li>
  )
}
