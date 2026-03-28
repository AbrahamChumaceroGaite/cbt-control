import { cn } from '@/lib/utils'

export function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={cn(
        'flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border',
        ok
          ? 'bg-emerald-950/90 border-emerald-800 text-emerald-400'
          : 'bg-red-950/90 border-red-800 text-red-400'
      )}>
        {ok
          ? <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          : <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        }
        <span className="text-sm font-medium text-white">{msg}</span>
      </div>
    </div>
  )
}
