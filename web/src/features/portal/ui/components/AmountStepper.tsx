import { Button } from '@/components/ui'

interface Props {
  amount:   number
  total:    number
  myCoins:  number
  onChange: (n: number) => void
}

export function AmountStepper({ amount, total, myCoins, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" className="w-10 h-10 text-lg font-bold" onClick={() => onChange(Math.max(1, amount - 1))}>−</Button>
        <input type="number" min={1} value={amount} onChange={e => onChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="flex-1 h-10 rounded-lg bg-zinc-800/80 border border-zinc-700 text-center text-lg font-black text-amber-300 focus:outline-none focus:border-amber-500/50 transition-colors" />
        <Button variant="secondary" size="sm" className="w-10 h-10 text-lg font-bold" onClick={() => onChange(amount + 1)}>+</Button>
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
    </div>
  )
}
