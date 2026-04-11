'use client'
import { Landmark, RefreshCw } from 'lucide-react'
import { SectionHeader }   from '@/components/shared/SectionHeader'
import { FilterPills }     from '@/components/shared/FilterPills'
import { Pagination }      from '@/components/shared/Pagination'
import { Skeleton }        from '@/components/ui'
import { useTransacciones, TX_PAGE_SIZE } from '../application/useTransacciones'
import { TxCard }          from './TxCard'
import { NoteModal }       from './NoteModal'

export function TransaccionesSection() {
  const {
    txs, loading, processing, noteModal, note, filter, page,
    filtered, paged, pending,
    load, process, setNoteModal, setNote, setFilter, setPage,
  } = useTransacciones()

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader icon={Landmark} iconClass="text-purple-400" title="Coin Transactions"
        subtitle="Approve or reject transfers between students."
        actions={
          <button onClick={load} title="Reload" className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />
      <FilterPills
        options={[
          { value: 'all'      as const, label: `All (${txs.length})`   },
          { value: 'pending'  as const, label: `Pending (${pending})`   },
          { value: 'approved' as const, label: 'Approved'               },
          { value: 'rejected' as const, label: 'Rejected'               },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : paged.length === 0 ? (
        <p className="text-center py-12 text-zinc-500 text-sm">
          No transactions{filter !== 'all' ? ' with that status' : ''}.
        </p>
      ) : (
        <div className="space-y-3">
          {paged.map(tx => (
            <TxCard key={tx.id} tx={tx} processing={processing}
              onOpenModal={s => { setNoteModal(s); setNote('') }}
            />
          ))}
        </div>
      )}
      <Pagination page={page} totalItems={filtered.length} pageSize={TX_PAGE_SIZE} onChange={setPage} />
      {noteModal && (
        <NoteModal modal={noteModal} note={note} processing={!!processing}
          onNote={setNote}
          onCancel={() => setNoteModal(null)}
          onConfirm={(id, status, n) => process(id, { status, adminNotes: n || undefined })}
        />
      )}
    </div>
  )
}
