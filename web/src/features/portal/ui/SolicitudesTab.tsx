'use client'
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList, Loader2, X } from 'lucide-react'
import { PortalTabHeader }     from './PortalTabHeader'
import { StatusBadge }         from '@/components/ui'
import { FilterPills }         from '@/components/shared/FilterPills'
import { ConfirmDialog }       from '@/components/shared/ConfirmDialog'
import { SearchInput }         from '@/components/ui'
import { DateFilterPopover }   from './components/DateFilterPopover'
import { useSolicitudesTab }   from '../application/useSolicitudesTab'
import type { StudentData, RedemptionReq, StatusFilter, DateFilter } from '../domain/types'
import { REQUEST_STATUS } from '@/config/status'

const PAGE_SIZE = 5

const STATUS_PILLS: { value: StatusFilter; label: string }[] = [
  { value: 'all',      label: 'Todos'      },
  { value: 'pending',  label: 'Pendientes' },
  { value: 'approved', label: 'Aprobados'  },
  { value: 'rejected', label: 'Rechazados' },
]


interface Props {
  student:  StudentData
  requests: RedemptionReq[]
  onLogout: () => void
  onReload: () => void
}

export function SolicitudesTab({ student, requests, onLogout, onReload }: Props) {
  const [page,         setPage]         = useState(0)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFilter,   setDateFilter]   = useState<DateFilter | null>(null)
  const [confirmId,    setConfirmId]    = useState<string | null>(null)
  const { cancelling, doCancel }        = useSolicitudesTab(onReload)

  const filtered = useMemo(() => {
    let r = [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      r = r.filter(req => req.reward?.name?.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') r = r.filter(req => req.status === statusFilter)
    if (dateFilter) {
      const from = new Date(dateFilter.from).getTime()
      const to   = new Date(dateFilter.to + 'T23:59:59').getTime()
      r = r.filter(req => { const t = new Date(req.createdAt).getTime(); return t >= from && t <= to })
    }
    return r
  }, [requests, search, statusFilter, dateFilter])

  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE)
  const paged        = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const pendingCount = requests.filter(r => r.status === REQUEST_STATUS.PENDING).length

  function resetPage() { setPage(0) }

  return (
    <div className="min-h-screen pb-28">
      <PortalTabHeader student={student} onLogout={onLogout} />

      <main className="max-w-2xl mx-auto px-4 pt-5">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">Mis Solicitudes</h2>
          <div className="flex-1 h-px bg-zinc-800" />
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[10px] font-bold text-amber-400">
              {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="space-y-2.5 mb-5">
          <SearchInput value={search} onChange={v => { setSearch(v); resetPage() }} placeholder="Buscar por nombre…" />
          <div className="flex items-center gap-2 flex-wrap">
            <FilterPills options={STATUS_PILLS} value={statusFilter} onChange={v => { setStatusFilter(v); resetPage() }} className="flex-1" />
            <DateFilterPopover
              filter={dateFilter}
              onApply={f => { setDateFilter(f); resetPage() }}
              onClear={() => { setDateFilter(null); resetPage() }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-600">
              {requests.length === 0 ? 'No tienes solicitudes aún' : 'Sin resultados con estos filtros'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {paged.map(req => (
                <div key={req.id} className="flex items-center gap-4 bg-zinc-900/70 rounded-2xl p-4 border border-zinc-800/40 hover:bg-zinc-900 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
                    {req.reward?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-200 truncate leading-tight">{req.reward?.name}</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      {new Date(req.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    {req.notes && <p className="text-[11px] text-zinc-500 mt-1 italic line-clamp-1">&ldquo;{req.notes}&rdquo;</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge status={req.status} variant="request" size="sm" />
                    {req.status === REQUEST_STATUS.PENDING && (
                      <button
                        onClick={() => setConfirmId(req.id)}
                        disabled={cancelling === req.id}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-zinc-600 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition-colors disabled:opacity-50"
                      >
                        {cancelling === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between py-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="text-xs text-zinc-500">{page + 1} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <ConfirmDialog
        open={!!confirmId}
        onConfirm={() => { const id = confirmId!; setConfirmId(null); doCancel(id) }}
        onCancel={() => setConfirmId(null)}
        title="Cancelar solicitud"
        message="¿Seguro que quieres cancelar esta solicitud pendiente? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        variant="red"
        loading={!!cancelling}
      />
    </div>
  )
}
