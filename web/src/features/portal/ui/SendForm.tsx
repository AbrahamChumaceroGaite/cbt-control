'use client'
import { CheckCircle2, Send, User, X, XCircle } from 'lucide-react'
import { Button }           from '@/components/ui'
import { useSendForm }      from '../application/useSendForm'
import { RecipientPicker }  from './RecipientPicker'
import { BANK_TX_LIMIT }   from '@/config/ui'
import type { CoinTransactionResponse } from '../domain/types'

interface Props {
  myCoins:   number
  remaining: number
  onSent:    (tx: CoinTransactionResponse) => void
}

export function SendForm({ myCoins, remaining, onSent }: Props) {
  const {
    courses, courseId, q, results, searching,
    recipient, amount, notes, state, errMsg, canSend, total,
    setCourseId, setQ, setRecipient, setAmount, setNotes, clearSearch, send,
  } = useSendForm({ myCoins, remaining, onSent })

  if (state === 'success') return (
    <div className="flex flex-col items-center gap-3 py-10 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
      </div>
      <p className="text-sm font-bold text-emerald-400">Request sent!</p>
      <p className="text-xs text-zinc-500 text-center">An admin will review the transaction shortly.</p>
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
      <div>
        <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-500 mb-2">Recipient</label>
        {recipient ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {recipient.avatarUrl ? <img src={recipient.avatarUrl} alt={recipient.name} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-zinc-200">{recipient.name}</p>
              <p className="text-[11px] text-zinc-500">{recipient.courseName}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRecipient(null)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <RecipientPicker courses={courses} courseId={courseId} q={q} results={results} searching={searching}
            onCourseChange={setCourseId} onQChange={setQ} onClearSearch={clearSearch} onSelect={setRecipient} />
        )}
      </div>
      {recipient && (
        <>
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-500 mb-2">Amount</label>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" className="w-10 h-10 text-lg font-bold" onClick={() => setAmount(Math.max(1, amount - 1))}>−</Button>
              <input type="number" min={1} value={amount} onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700 text-center text-lg font-black text-amber-300 focus:outline-none focus:border-amber-500/50 transition-colors" />
              <Button variant="secondary" size="sm" className="w-10 h-10 text-lg font-bold" onClick={() => setAmount(amount + 1)}>+</Button>
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400"><span>Amount</span><span className="font-bold text-zinc-200">{amount} coins</span></div>
            <div className="flex justify-between text-zinc-500"><span>Tax</span><span className="font-semibold text-zinc-400">1 coin</span></div>
            <div className="h-px bg-zinc-800" />
            <div className="flex justify-between font-bold">
              <span className="text-zinc-300">Total to deduct</span>
              <span className={total > myCoins ? 'text-red-400' : 'text-amber-400'}>{total} coins</span>
            </div>
            <div className="flex justify-between text-zinc-600"><span>Your balance</span><span>{myCoins} coins</span></div>
          </div>
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-zinc-500 mb-2">Note (optional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} maxLength={120}
              placeholder="What are these coins for?"
              className="w-full h-9 px-3 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
          </div>
          {remaining === 0 && (
            <p className="text-xs text-red-400 text-center">You have reached the weekly limit of {BANK_TX_LIMIT} transactions.</p>
          )}
          <Button
            variant={canSend ? 'amber' : 'secondary'}
            size="lg"
            loading={state === 'sending'}
            disabled={!canSend}
            onClick={send}
            className={`w-full rounded-xl active:scale-[0.98] ${canSend ? 'shadow-[0_0_20px_rgba(245,158,11,0.25)]' : 'cursor-not-allowed'}`}
          >
            <Send className="w-4 h-4" /> Enviar solicitud
          </Button>
        </>
      )}
    </div>
  )
}
