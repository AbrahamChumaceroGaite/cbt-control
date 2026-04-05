'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ArrowRight, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, Coins, Search, Send, Shield, User, X, XCircle, Loader2,
} from 'lucide-react'
import { portalService, type CoinTransactionResponse, type StudentData, type StudentSearchResult, type WeeklyBankStatus } from '@/services/portal.service'
import { PortalTabHeader } from '@/features/portal/PortalTabHeader'
import { useSocketEvent } from '@/hooks/useSocketEvent'
import { WS } from '@/ws/events'

const TAX   = 1
const LIMIT = 3

// ─── Status bar ──────────────────────────────────────────────────────────────

function WeeklyBar({ status }: { status: WeeklyBankStatus }) {
  const pct = Math.round((status.used / status.limit) * 100)
  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-zinc-500">Límite Semanal</span>
        </div>
        <span className={`text-xs font-black ${status.remaining === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {status.remaining} restante{status.remaining !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: status.limit }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full transition-all duration-500 ${
              i < status.used ? 'bg-purple-500' : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-zinc-600 mt-2">
        {status.used}/{status.limit} transacciones usadas esta semana · Se resetean el lunes
      </p>
    </div>
  )
}

// ─── Student search ───────────────────────────────────────────────────────────

function StudentSearch({ onSelect }: { onSelect: (s: StudentSearchResult) => void }) {
  const [q, setQ]           = useState('')
  const [results, setRes]   = useState<StudentSearchResult[]>([])
  const [loading, setLoad]  = useState(false)
  const timerRef            = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (q.trim().length < 2) { setRes([]); return }
    setLoad(true)
    timerRef.current = setTimeout(async () => {
      try {
        const r = await portalService.searchStudents(q)
        setRes(r)
      } finally { setLoad(false) }
    }, 350)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [q])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar alumno por nombre…"
          className="w-full h-10 pl-9 pr-8 rounded-xl bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 animate-spin" />}
        {!loading && q && <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-300" /></button>}
      </div>
      {results.length > 0 && (
        <div className="rounded-xl border border-zinc-700/60 bg-zinc-900 overflow-hidden shadow-2xl">
          {results.map(s => (
            <button
              key={s.id}
              onClick={() => { onSelect(s); setQ('') }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors border-b border-zinc-800/50 last:border-0 text-left"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {s.avatarUrl
                  ? <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" />
                  : <User className="w-4 h-4 text-purple-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-200 truncate">{s.name}</p>
                <p className="text-[11px] text-zinc-500">{s.courseName}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
            </button>
          ))}
        </div>
      )}
      {q.trim().length >= 2 && results.length === 0 && !loading && (
        <p className="text-xs text-zinc-600 text-center py-2">Sin resultados para "{q}"</p>
      )}
    </div>
  )
}

// ─── Send form ────────────────────────────────────────────────────────────────

type SendState = 'idle' | 'sending' | 'success' | 'error'

function SendForm({
  myCoins, remaining, onSent,
}: {
  myCoins: number
  remaining: number
  onSent: (tx: CoinTransactionResponse) => void
}) {
  const [recipient, setRecipient] = useState<StudentSearchResult | null>(null)
  const [amount,    setAmount]    = useState(1)
  const [notes,     setNotes]     = useState('')
  const [state,     setState]     = useState<SendState>('idle')
  const [errMsg,    setErrMsg]    = useState('')

  const total    = amount + TAX
  const canSend  = !!recipient && amount >= 1 && myCoins >= total && remaining > 0

  async function send() {
    if (!recipient || !canSend) return
    setState('sending')
    try {
      const { data } = await portalService.createTransaction({ toStudentId: recipient.id, amount, notes: notes || undefined })
      setState('success')
      setTimeout(() => { setState('idle'); setRecipient(null); setAmount(1); setNotes('') }, 2500)
      if (data) onSent(data)
    } catch (err: any) {
      setErrMsg(err.message ?? 'Error al enviar')
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  if (state === 'success') return (
    <div className="flex flex-col items-center gap-3 py-10 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
      </div>
      <p className="text-sm font-bold text-emerald-400">¡Solicitud enviada!</p>
      <p className="text-xs text-zinc-500 text-center">El administrador revisará la transacción pronto.</p>
    </div>
  )

  if (state === 'error') return (
    <div className="flex flex-col items-center gap-3 py-10 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
        <XCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-sm font-bold text-red-400">Error</p>
      <p className="text-xs text-zinc-500 text-center">{errMsg}</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Recipient */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-500 mb-2">Destinatario</label>
        {recipient ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/25">
            <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {recipient.avatarUrl
                ? <img src={recipient.avatarUrl} alt={recipient.name} className="w-full h-full object-cover" />
                : <User className="w-4 h-4 text-purple-400" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-zinc-200">{recipient.name}</p>
              <p className="text-[11px] text-zinc-500">{recipient.courseName}</p>
            </div>
            <button onClick={() => setRecipient(null)} className="p-1 text-zinc-600 hover:text-zinc-300 rounded-lg">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <StudentSearch onSelect={setRecipient} />
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-500 mb-2">Cantidad</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAmount(a => Math.max(1, a - 1))}
            className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors font-bold text-lg"
          >−</button>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700 text-center text-lg font-black text-purple-300 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          <button
            onClick={() => setAmount(a => a + 1)}
            className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors font-bold text-lg"
          >+</button>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 space-y-1.5 text-xs">
        <div className="flex justify-between text-zinc-400">
          <span>Monto</span><span className="font-bold text-zinc-200">{amount} coins</span>
        </div>
        <div className="flex justify-between text-zinc-500">
          <span>Impuesto</span><span className="font-semibold text-zinc-400">{TAX} coin</span>
        </div>
        <div className="h-px bg-zinc-800" />
        <div className="flex justify-between font-bold">
          <span className="text-zinc-300">Total a descontar</span>
          <span className={total > myCoins ? 'text-red-400' : 'text-purple-400'}>{total} coins</span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>Tu saldo actual</span><span>{myCoins} coins</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-500 mb-2">Nota (opcional)</label>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          maxLength={120}
          placeholder="¿Para qué son estos coins?"
          className="w-full h-9 px-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>

      {remaining === 0 && (
        <p className="text-xs text-red-400 text-center">Has alcanzado el límite semanal de {LIMIT} transacciones.</p>
      )}

      <button
        onClick={send}
        disabled={!canSend || state === 'sending'}
        className={`w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
          canSend
            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.25)]'
            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
        }`}
      >
        {state === 'sending'
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
          : <><Send className="w-4 h-4" /> Enviar solicitud</>}
      </button>
    </div>
  )
}

// ─── Transaction history ──────────────────────────────────────────────────────

type HistoryFilter = 'all' | 'sent' | 'received'

function TxHistory({ txs, myStudentId }: { txs: CoinTransactionResponse[]; myStudentId: string }) {
  const [filter, setFilter]   = useState<HistoryFilter>('all')
  const [page,   setPage]     = useState(0)
  const PAGE = 5

  const filtered = txs.filter(tx => {
    if (filter === 'sent')     return tx.fromStudent.id === myStudentId
    if (filter === 'received') return tx.toStudent.id === myStudentId
    return true
  })

  const totalPages = Math.ceil(filtered.length / PAGE)
  const paged      = filtered.slice(page * PAGE, (page + 1) * PAGE)

  const STATUS_STYLES: Record<string, string> = {
    pending:  'bg-amber-500/15 text-amber-400 border-amber-500/25',
    approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/25',
  }
  const STATUS_LABELS: Record<string, string> = {
    pending:  'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
  }

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-1.5 mb-4">
        {(['all', 'sent', 'received'] as HistoryFilter[]).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0) }}
            className={`px-3 h-7 rounded-lg text-xs font-semibold transition-colors ${
              filter === f ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'sent' ? 'Enviadas' : 'Recibidas'}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-zinc-600 self-center">{filtered.length} transacciones</span>
      </div>

      {paged.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
            <Coins className="w-4 h-4 text-zinc-600" />
          </div>
          <p className="text-xs text-zinc-600">Sin transacciones</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paged.map(tx => {
              const isSent = tx.fromStudent.id === myStudentId
              const other  = isSent ? tx.toStudent : tx.fromStudent
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:bg-zinc-900/80 transition-colors">
                  {/* Direction icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSent ? 'bg-red-500/10 border border-red-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
                  }`}>
                    <Send className={`w-4 h-4 ${isSent ? 'text-red-400 rotate-12' : 'text-emerald-400 -rotate-12'}`} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      {isSent ? `→ ${other.name}` : `← ${other.name}`}
                    </p>
                    <p className="text-[10px] text-zinc-600">{other.courseName} · {new Date(tx.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}</p>
                    {tx.notes && <p className="text-[10px] text-zinc-500 truncate mt-0.5 italic">"{tx.notes}"</p>}
                  </div>
                  {/* Amount + status */}
                  <div className="text-right flex-shrink-0 space-y-1">
                    <p className={`text-sm font-black ${isSent ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isSent ? '-' : '+'}{isSent ? tx.amount + tx.tax : tx.amount}
                    </p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${STATUS_STYLES[tx.status] ?? ''}`}>
                      {STATUS_LABELS[tx.status] ?? tx.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-500">{page + 1} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  student:  StudentData
  onLogout: () => void
  onCoinsUpdate: (coins: number) => void
}

export function BankTab({ student, onLogout, onCoinsUpdate }: Props) {
  const [status, setStatus] = useState<WeeklyBankStatus>({ used: 0, limit: LIMIT, remaining: LIMIT })
  const [txs,    setTxs]    = useState<CoinTransactionResponse[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, t] = await Promise.all([
        portalService.getBankStatus(),
        portalService.getMyTransactions(),
      ])
      setStatus(s)
      setTxs(t)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // Real-time: transaction updated → reload status + txs + coins
  useSocketEvent(WS.TRANSACTION_UPDATED, () => { load() })
  useSocketEvent(WS.COINS_UPDATED, ({ studentId, studentCoins }) => {
    if (studentId === student.id && studentCoins !== undefined) onCoinsUpdate(studentCoins)
  })

  function handleSent(tx: CoinTransactionResponse) {
    setTxs(prev => [tx, ...prev])
    setStatus(s => ({ ...s, used: s.used + 1, remaining: Math.max(0, s.remaining - 1) }))
    // optimistically deduct coins
    onCoinsUpdate(student.coins - tx.amount - tx.tax)
  }

  return (
    <div className="min-h-screen pb-28">
      <PortalTabHeader student={student} onLogout={onLogout} />

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* Balance hero */}
        <section className="relative overflow-hidden rounded-2xl bg-zinc-900/80 p-5 flex items-center gap-4">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 w-14 h-14 bg-purple-500/15 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-[inset_0_0_20px_rgba(147,51,234,0.1)] flex-shrink-0">
            <Coins className="w-6 h-6 text-purple-400" />
          </div>
          <div className="relative z-10 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">Tu Saldo</p>
            <p className="text-3xl font-black text-purple-300 tracking-tight leading-none">{student.coins} <span className="text-sm font-bold text-purple-400/60">coins</span></p>
          </div>
          <div className="relative z-10 text-right">
            <p className="text-[10px] text-zinc-600">Impuesto</p>
            <p className="text-xs font-bold text-zinc-400">1 coin / tx</p>
          </div>
        </section>

        {/* Weekly status */}
        {!loading && <WeeklyBar status={status} />}

        {/* Send form */}
        <section className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-800">
            <Send className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-300">Enviar Coins</h2>
          </div>
          <div className="p-5">
            <SendForm
              myCoins={student.coins}
              remaining={status.remaining}
              onSent={handleSent}
            />
          </div>
        </section>

        {/* History */}
        <section className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-800">
            <Clock className="w-4 h-4 text-zinc-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-300">Historial</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-zinc-600" /></div>
            ) : (
              <TxHistory txs={txs} myStudentId={student.id} />
            )}
          </div>
        </section>

      </main>
    </div>
  )
}
