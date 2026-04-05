'use client'
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList, Search, CalendarDays, X } from 'lucide-react'
import { PortalTabHeader } from '@/features/portal/PortalTabHeader'
import type { StudentData, RedemptionReq } from '@/services/portal.service'

const PAGE_SIZE = 5

const STATUS_STYLES = {
  approved: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/40', label: '✓ Aprobado' },
  rejected: { bg: 'bg-red-950/60',     text: 'text-red-400',     border: 'border-red-800/40',     label: '✕ Rechazado' },
  pending:  { bg: 'bg-amber-950/60',   text: 'text-amber-400',   border: 'border-amber-800/40',   label: '⏳ Pendiente' },
} as const

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

interface DateFilter { from: string; to: string }

function DatePopover({ filter, onApply, onClear }: { filter: DateFilter | null; onApply: (f: DateFilter) => void; onClear: () => void }) {
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(filter?.from ?? '')
  const [to,   setTo]   = useState(filter?.to   ?? '')
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          filter ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <CalendarDays className="w-3 h-3" />
        {filter ? `${filter.from} → ${filter.to}` : 'Fecha'}
        {filter && <X className="w-3 h-3 ml-0.5" onClick={e => { e.stopPropagation(); setFrom(''); setTo(''); onClear(); setOpen(false) }} />}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-2xl p-3 space-y-2.5">
          <div className="space-y-1">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider">Desde</label>
            <input type="date" value={from} max={today} onChange={e => setFrom(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider">Hasta</label>
            <input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setFrom(''); setTo(''); onClear(); setOpen(false) }}
              className="flex-1 h-8 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">Limpiar</button>
            <button onClick={() => { if (from) { onApply({ from, to: to || today }); setOpen(false) } }} disabled={!from}
              className="flex-1 h-8 rounded-lg bg-amber-500 text-zinc-900 text-xs font-bold hover:bg-amber-400 disabled:opacity-40 transition-colors">Aplicar</button>
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  student: StudentData
  requests: RedemptionReq[]
  onLogout: () => void
}

export function SolicitudesTab({ student, requests, onLogout }: Props) {
  const [page,       setPage]       = useState(0)
  const [search,     setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null)

  const filtered = useMemo(() => {
    let r = [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      r = r.filter(req => req.reward?.name?.toLowerCase().includes(q))
    }
    if (statusFilter !== 'all') {
      r = r.filter(req => req.status === statusFilter)
    }
    if (dateFilter) {
      const from = new Date(dateFilter.from).getTime()
      const to   = new Date(dateFilter.to + 'T23:59:59').getTime()
      r = r.filter(req => {
        const t = new Date(req.createdAt).getTime()
        return t >= from && t <= to
      })
    }
    return r
  }, [requests, search, statusFilter, dateFilter])

  const totalPages   = Math.ceil(filtered.length / PAGE_SIZE)
  const paged        = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const pendingCount = requests.filter(r => r.status === 'pending').length

  function resetPage() { setPage(0) }

  const STATUS_PILLS: { value: StatusFilter; label: string }[] = [
    { value: 'all',      label: 'Todos' },
    { value: 'pending',  label: 'Pendientes' },
    { value: 'approved', label: 'Aprobados' },
    { value: 'rejected', label: 'Rechazados' },
  ]

  return (
    <div className="min-h-screen pb-28">
      <PortalTabHeader student={student} onLogout={onLogout} />

      <main className="max-w-2xl mx-auto px-4 pt-5">

        {/* Section title + pending badge */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">Mis Solicitudes</h2>
          <div className="flex-1 h-px bg-zinc-800" />
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[10px] font-bold text-amber-400">
              {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-2.5 mb-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre…"
              value={search}
              onChange={e => { setSearch(e.target.value); resetPage() }}
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-zinc-900/80 border border-zinc-800/60 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-zinc-600"
            />
          </div>

          {/* Status pills + date */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1.5 flex-wrap flex-1">
              {STATUS_PILLS.map(p => (
                <button
                  key={p.value}
                  onClick={() => { setStatusFilter(p.value); resetPage() }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                    statusFilter === p.value
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-zinc-900/60 border-zinc-800/40 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <DatePopover
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
              {paged.map(req => {
                const s = STATUS_STYLES[req.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.pending
                return (
                  <div key={req.id} className="flex items-center gap-4 bg-zinc-900/70 rounded-2xl p-4 border border-zinc-800/40 hover:bg-zinc-900 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
                      {req.reward?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-200 truncate leading-tight">{req.reward?.name}</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {new Date(req.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      {req.notes && <p className="text-[11px] text-zinc-500 mt-1 italic line-clamp-1">"{req.notes}"</p>}
                    </div>
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
    </div>
  )
}
