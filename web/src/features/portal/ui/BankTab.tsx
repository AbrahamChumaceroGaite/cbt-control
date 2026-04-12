'use client'
import { Clock, Coins, Send } from 'lucide-react'
import { useBankTab }        from '../application/useBankTab'
import { PortalTabHeader }   from './PortalTabHeader'
import { WeeklyBar }         from './WeeklyBar'
import { SendForm }          from './SendForm'
import { TxHistory }         from './TxHistory'
import { Spinner }           from '@/components/ui'
import type { StudentData }  from '../domain/types'

interface Props {
  student:       StudentData
  onLogout:      () => void
  onCoinsUpdate: (coins: number) => void
}

export function BankTab({ student, onLogout, onCoinsUpdate }: Props) {
  const { status, txs, loading, handleSent } = useBankTab({
    studentId:     student.id,
    studentCoins:  student.coins,
    onCoinsUpdate,
  })

  return (
    <div className="min-h-screen pb-28">
      <PortalTabHeader student={student} onLogout={onLogout} />
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        <section className="relative overflow-hidden rounded-2xl bg-zinc-900/80 p-5 flex items-center gap-4">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 w-14 h-14 bg-amber-500/15 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)] flex-shrink-0">
            <Coins className="w-6 h-6 text-amber-400" />
          </div>
          <div className="relative z-10 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">Your Balance</p>
            <p className="text-3xl font-black text-amber-300 tracking-tight leading-none">
              {student.coins} <span className="text-sm font-bold text-amber-400/60">coins</span>
            </p>
          </div>
          <div className="relative z-10 text-right">
            <p className="text-[10px] text-zinc-600">Tax</p>
            <p className="text-xs font-bold text-zinc-400">1 coin / tx</p>
          </div>
        </section>

        {!loading && <WeeklyBar status={status} />}

        <section className="rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-800">
            <Send className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-300">Send Coins</h2>
          </div>
          <div className="p-5">
            <SendForm myCoins={student.coins} remaining={status.remaining} onSent={handleSent} />
          </div>
        </section>

        <section className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-800">
            <Clock className="w-4 h-4 text-zinc-500" />
            <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-300">History</h2>
          </div>
          <div className="p-4">
            {loading
              ? <div className="flex justify-center py-8"><Spinner size="sm" /></div>
              : <TxHistory txs={txs} myStudentId={student.id} />
            }
          </div>
        </section>

      </main>
    </div>
  )
}
