'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { PortalTabHeader } from '@/features/portal/PortalTabHeader'
import type { StudentData, RedemptionReq } from '@/services/portal.service'

const PAGE_SIZE = 5

const STATUS_STYLES = {
  approved: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/40', label: '✓ Aprobado' },
  rejected: { bg: 'bg-red-950/60',     text: 'text-red-400',     border: 'border-red-800/40',     label: '✕ Rechazado' },
  pending:  { bg: 'bg-amber-950/60',   text: 'text-amber-400',   border: 'border-amber-800/40',   label: '⏳ Pendiente' },
} as const

interface Props {
  student: StudentData
  requests: RedemptionReq[]
  onLogout: () => void
}

export function SolicitudesTab({ student, requests, onLogout }: Props) {
  const [page, setPage] = useState(0)

  const sorted     = [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paged      = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen pb-28">
      <PortalTabHeader student={student} onLogout={onLogout} />

      <main className="max-w-2xl mx-auto px-4 pt-6">

        {/* Summary strip */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">
            Mis Solicitudes
          </h2>
          <div className="flex-1 h-px bg-zinc-800" />
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[10px] font-bold text-amber-400">
              {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-600">No tienes solicitudes aún</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {paged.map(req => {
                const s = STATUS_STYLES[req.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.pending
                return (
                  <div key={req.id} className="flex items-center gap-4 bg-zinc-900/70 rounded-2xl p-4 border border-zinc-800/40 hover:bg-zinc-900 transition-colors">
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
                      {req.reward?.icon}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-200 truncate leading-tight">{req.reward?.name}</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {new Date(req.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      {req.notes && (
                        <p className="text-[11px] text-zinc-500 mt-1 italic line-clamp-1">"{req.notes}"</p>
                      )}
                    </div>
                    {/* Status badge */}
                    <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
                      {s.label}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="text-xs text-zinc-500">{page + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
