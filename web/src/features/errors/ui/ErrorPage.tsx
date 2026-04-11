'use client'

interface Props {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function ErrorPage({ error, reset }: Props) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-7xl font-black text-red-400/20 select-none">!</div>
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold text-zinc-200">Algo salió mal</h1>
        <p className="text-sm text-zinc-500">{error.message || 'Error inesperado. Por favor reintenta.'}</p>
        {error.digest && (
          <p className="text-[11px] text-zinc-700 font-mono">digest: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors"
      >
        Reintentar
      </button>
    </div>
  )
}
