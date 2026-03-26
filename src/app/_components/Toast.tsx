'use client'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={cn(
        'flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border',
        ok
          ? 'bg-[#064e3b]/90 border-[#047857] text-[#34d399]'
          : 'bg-[#7f1d1d]/90 border-[#b91c1c] text-[#fca5a5]'
      )}>
        {ok ? <Check size={18} /> : <X size={18} />}
        <span className="text-sm font-medium text-white">{msg}</span>
      </div>
    </div>
  )
}
