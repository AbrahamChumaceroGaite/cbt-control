import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-7xl font-black text-amber-400/20 select-none">404</div>
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold text-zinc-200">Página no encontrada</h1>
        <p className="text-sm text-zinc-500">La dirección que buscas no existe o fue movida.</p>
      </div>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm font-semibold hover:bg-amber-500/20 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
