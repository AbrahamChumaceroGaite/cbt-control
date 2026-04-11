'use client'
import { useUiStore }      from '@/store/ui.store'
import { cn }              from '@/lib/utils'
import { TOAST_SCHEME, Z } from '@/config/scheme'

function CheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function ToastContainer() {
  const toasts = useUiStore(s => s.toasts)
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-6 right-6 flex flex-col gap-2 pointer-events-none" style={{ zIndex: Z.TOAST }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl border pointer-events-auto',
            'animate-in slide-in-from-top-4 fade-in duration-300',
            t.success ? TOAST_SCHEME.success : TOAST_SCHEME.error,
          )}
        >
          {t.success ? <CheckIcon /> : <XIcon />}
          <span className="text-sm font-medium text-white">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
