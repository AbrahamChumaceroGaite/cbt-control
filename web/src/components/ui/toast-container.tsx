'use client'
import { useUiStore } from '@/store/ui.store'
import { cn }         from '@/lib/utils'

export function ToastContainer() {
  const toasts = useUiStore(s => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-6 right-6 z-[600] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border pointer-events-auto',
            'animate-in slide-in-from-top-4 fade-in duration-300',
            t.success
              ? 'bg-emerald-950/90 border-emerald-800 text-emerald-400'
              : 'bg-red-950/90 border-red-800 text-red-400',
          )}
        >
          {t.success
            ? <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          <span className="text-sm font-medium text-white">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
