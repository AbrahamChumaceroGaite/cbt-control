'use client'
import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, ArrowRight, Landmark, RefreshCw } from 'lucide-react'
import { apiFetch, apiFetchFull } from '@/lib/api'
import type { CoinTransactionResponse } from '@control-aula/shared'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Pagination }    from '@/components/shared/Pagination'
import { useSocketEvent } from '@/hooks/useSocketEvent'
import { WS }            from '@/ws/events'

const STATUS_STYLE: Record<string, { label: string; pill: string }> = {
  pending:  { label: 'Pendiente', pill: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  approved: { label: 'Aprobada',  pill: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  rejected: { label: 'Rechazada', pill: 'bg-red-500/15 text-red-400 border-red-500/25' },
}

interface ProcessPayload { status: 'approved' | 'rejected'; adminNotes?: string }

interface Props {
  showToast: (msg: string, ok?: boolean) => void
}

export function TransaccionesSection({ showToast }: Props) {
  const [txs,        setTxs]        = useState<CoinTransactionResponse[]>([])
  const [loading,    setLoading]    = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [noteModal,  setNoteModal]  = useState<{ id: string; status: 'approved' | 'rejected' } | null>(null)
  const [note,       setNote]       = useState('')
  const [filter,     setFilter]     = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [page,       setPage]       = useState(0)
  const PAGE_SIZE = 8

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<CoinTransactionResponse[]>('/api/bank/admin/transactions')
      setTxs(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useSocketEvent(WS.TRANSACTION_NEW, () => load())

  async function process(id: string, payload: ProcessPayload) {
    setProcessing(id)
    try {
      await apiFetchFull('/api/bank/admin/transactions/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      showToast(payload.status === 'approved' ? 'Transacción aprobada' : 'Transacción rechazada', payload.status === 'approved')
      setTxs(prev => prev.map(t => t.id === id ? { ...t, status: payload.status } : t))
    } catch (err: any) {
      showToast(err.message ?? 'Error al procesar', false)
    } finally { setProcessing(null); setNoteModal(null); setNote('') }
  }

  function openModal(id: string, status: 'approved' | 'rejected') {
    setNoteModal({ id, status }); setNote('')
  }

  const filtered = txs.filter(t => filter === 'all' || t.status === filter)
  const paged    = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const pending  = txs.filter(t => t.status === 'pending').length

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        icon={Landmark}
        iconClass="text-purple-400"
        title="Transacciones de Coins"
        subtitle="Aprueba o rechaza transferencias entre alumnos."
        actions={
          <button onClick={load} title="Recargar" className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Status filter */}
      <div className="flex gap-1.5 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(0) }}
            className={`px-3 h-7 rounded-lg text-xs font-semibold transition-colors ${
              filter === f ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 border border-transparent'
            }`}>
            {f === 'all' ? `Todas (${txs.length})` : f === 'pending' ? `Pendientes (${pending})` : f === 'approved' ? 'Aprobadas' : 'Rechazadas'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-zinc-900/60 animate-pulse" />
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-sm">Sin transacciones{filter !== 'all' ? ' con ese estado' : ''}.</div>
      ) : (
        <div className="space-y-3">
          {paged.map(tx => (
            <div key={tx.id} className={`rounded-xl border p-4 flex items-center gap-4 ${tx.status === 'pending' ? 'bg-zinc-900/80 border-purple-500/20' : 'bg-zinc-900/40 border-zinc-800'}`}>
              {/* Arrow visual */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-center">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300">
                    {tx.fromStudent.name.charAt(0)}
                  </div>
                  <p className="text-[9px] text-zinc-600 mt-0.5 max-w-[48px] truncate">{tx.fromStudent.name.split(' ')[0]}</p>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-black text-purple-400">{tx.amount}c</span>
                  <ArrowRight className="w-4 h-4 text-zinc-600" />
                  <span className="text-[9px] text-zinc-600">+{tx.tax}c imp</span>
                </div>
                <div className="text-center">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300">
                    {tx.toStudent.name.charAt(0)}
                  </div>
                  <p className="text-[9px] text-zinc-600 mt-0.5 max-w-[48px] truncate">{tx.toStudent.name.split(' ')[0]}</p>
                </div>
              </div>

              {/* Detail */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  {tx.fromStudent.name} → {tx.toStudent.name}
                </p>
                <p className="text-[10px] text-zinc-500">{tx.fromStudent.courseName} · {new Date(tx.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                {tx.notes && <p className="text-[10px] text-zinc-500 italic truncate">"{tx.notes}"</p>}
                {tx.adminNotes && <p className="text-[10px] text-zinc-600 truncate">Admin: {tx.adminNotes}</p>}
              </div>

              {/* Status + Actions */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[tx.status]?.pill ?? ''}`}>
                  {STATUS_STYLE[tx.status]?.label ?? tx.status}
                </span>
                {tx.status === 'pending' && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openModal(tx.id, 'approved')}
                      disabled={!!processing}
                      className="flex items-center gap-1 px-2.5 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-xs font-bold hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                    </button>
                    <button
                      onClick={() => openModal(tx.id, 'rejected')}
                      disabled={!!processing}
                      className="flex items-center gap-1 px-2.5 h-7 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 text-xs font-bold hover:bg-red-500/25 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageSizeChange={() => {}} onChange={p => setPage(p)} />

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNoteModal(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-zinc-200">
              {noteModal.status === 'approved' ? '✓ Aprobar transacción' : '✗ Rechazar transacción'}
            </h3>
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Nota (opcional)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Motivo o comentario…"
                className="w-full h-9 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/40"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setNoteModal(null)} className="flex-1 h-9 rounded-xl border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => process(noteModal.id, { status: noteModal.status, adminNotes: note || undefined })}
                disabled={!!processing}
                className={`flex-1 h-9 rounded-xl text-xs font-bold transition-colors ${
                  noteModal.status === 'approved'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-red-600 text-white hover:bg-red-500'
                } disabled:opacity-50`}
              >
                {processing ? 'Procesando…' : noteModal.status === 'approved' ? 'Confirmar aprobación' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
