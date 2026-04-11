// uses socket — subscribes to WS.TRANSACTION_NEW
import { useCallback, useEffect, useState } from 'react'
import { transaccionesService }             from '../infrastructure/transacciones.service'
import { useToast }                         from '@/hooks/useToast'
import { useSocketEvent }                   from '@/hooks/useSocketEvent'
import { WS }                               from '@/ws/events'
import { TRANSACTION_STATUS }              from '@/config/status'
import type { CoinTransactionResponse }     from '@control-aula/shared'
import type { TxFilter, ProcessPayload, NoteModalState } from '../domain/types'

export const TX_PAGE_SIZE = 8

export function useTransacciones() {
  const { showToast } = useToast()
  const [txs,       setTxs]       = useState<CoinTransactionResponse[]>([])
  const [loading,   setLoading]   = useState(true)
  const [processing,setProcessing]= useState<string | null>(null)
  const [noteModal, setNoteModal] = useState<NoteModalState | null>(null)
  const [note,      setNote]      = useState('')
  const [filter,    setFilter]    = useState<TxFilter>('all')
  const [page,      setPage]      = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await transaccionesService.getAll()
      setTxs(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])
  useSocketEvent(WS.TRANSACTION_NEW, () => { load() })

  async function process(id: string, payload: ProcessPayload) {
    setProcessing(id)
    try {
      await transaccionesService.process(id, payload)
      showToast(
        payload.status === TRANSACTION_STATUS.APPROVED ? 'Transaction approved' : 'Transaction rejected',
        payload.status === TRANSACTION_STATUS.APPROVED,
      )
      setTxs(prev => prev.map(t => t.id === id ? { ...t, status: payload.status } : t))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error processing transaction', false)
    } finally { setProcessing(null); setNoteModal(null); setNote('') }
  }

  const filtered = txs.filter(t => filter === 'all' || t.status === filter)
  const paged    = filtered.slice(page * TX_PAGE_SIZE, (page + 1) * TX_PAGE_SIZE)
  const pending  = txs.filter(t => t.status === TRANSACTION_STATUS.PENDING).length

  return {
    txs, loading, processing, noteModal, note, filter, page,
    filtered, paged, pending,
    load,
    process,
    setNoteModal,
    setNote,
    setFilter: (v: TxFilter) => { setFilter(v); setPage(0) },
    setPage,
  }
}
