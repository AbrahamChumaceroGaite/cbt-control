'use client'
import { useState }        from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EmptyState }      from '@/components/ui'
import { Button }          from '@/components/ui'
import type { StudentData } from '@/services/portal.service'

const PAGE_SIZE = 10

const CATEGORY_COLORS: Record<string, { text: string; dot: string }> = {
  green:  { text: 'text-green-400',  dot: 'bg-green-400' },
  blue:   { text: 'text-blue-400',   dot: 'bg-blue-400' },
  red:    { text: 'text-red-400',    dot: 'bg-red-400' },
  amber:  { text: 'text-amber-400',  dot: 'bg-amber-400' },
  purple: { text: 'text-purple-400', dot: 'bg-purple-400' },
  mag:    { text: 'text-fuchsia-400',dot: 'bg-fuchsia-400' },
}

export function PerfilTab({ student }: { student: StudentData }) {
  const [page, setPage] = useState(0)
  const logs   = student.coinLogs
  const total  = logs.length
  const pages  = Math.ceil(total / PAGE_SIZE)
  const paged  = logs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Groups */}
      {student.groupMemberships.length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl px-4 py-3">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Mis Grupos</div>
          <div className="flex flex-wrap gap-1.5">
            {student.groupMemberships.map(m => (
              <div key={m.group.id} className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
                <span>👥</span> {m.group.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Historial
          </div>
          {total > 0 && (
            <span className="text-[10px] text-zinc-600">{total} movimientos</span>
          )}
        </div>

        {total === 0 ? (
          <EmptyState icon={<span className="text-2xl">🪙</span>} title="Sin movimientos aún" />
        ) : (
          <>
            <div className="divide-y divide-zinc-800/40">
              {paged.map(log => {
                const cat = log.action?.category ?? ''
                const col = CATEGORY_COLORS[cat] ?? { text: 'text-zinc-400', dot: 'bg-zinc-500' }
                return (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${col.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-300 truncate">{log.action?.name ?? log.reason}</div>
                      <div className="text-[11px] text-zinc-600 mt-0.5">
                        {new Date(log.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className={`text-sm font-bold shrink-0 ${log.coins >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {log.coins > 0 ? '+' : ''}{log.coins}
                    </div>
                  </div>
                )
              })}
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800/60">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="h-7 w-7"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="text-[11px] text-zinc-500">
                  {page + 1} / {pages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
                  disabled={page === pages - 1}
                  className="h-7 w-7"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
