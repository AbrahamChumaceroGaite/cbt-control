import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'
import { SearchInput }         from '@/components/ui'
import { FilterPills }         from '@/components/shared/FilterPills'
import { DateFilterPopover }   from './DateFilterPopover'
import { SolicitudItem }       from './SolicitudItem'
import type { RedemptionReq, StatusFilter, DateFilter } from '../../domain/types'

const PAGE_SIZE = 5

const STATUS_PILLS: { value: StatusFilter; label: string }[] = [
  { value: 'all',      label: 'All'      },
  { value: 'pending',  label: 'Pending'  },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

interface Props {
  requests:   RedemptionReq[]
  cancelling: string | null
  onCancel:   (id: string) => void
}

export function SolicitudListSection({ requests, cancelling, onCancel }: Props) {
  const [page,         setPage]         = useState(0)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [dateFilter,   setDateFilter]   = useState<DateFilter | null>(null)

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

  const reset      = () => setPage(0)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged      = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <>
      <div className="space-y-2.5 mb-5">
        <SearchInput value={search} onChange={v => { setSearch(v); reset() }} placeholder="Search by name…" />
        <div className="flex items-center gap-2 flex-wrap">
          <FilterPills options={STATUS_PILLS} value={statusFilter} onChange={v => { setStatusFilter(v as StatusFilter); reset() }} className="flex-1" />
          <DateFilterPopover
            filter={dateFilter}
            onApply={f => { setDateFilter(f); reset() }}
            onClear={() => { setDateFilter(null); reset() }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-600">
            {requests.length === 0 ? 'No requests yet' : 'No results with these filters'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {paged.map(req => (
              <SolicitudItem key={req.id} req={req} cancelling={cancelling} onCancel={onCancel} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between py-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs text-zinc-500">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
