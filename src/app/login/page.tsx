'use client'
import { useState, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'admin' | 'student'>('student')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(m: 'admin' | 'student') {
    setMode(m)
    setCode('')
    setPassword('')
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body: any = { code: code.trim().toLowerCase(), mode }
      if (mode === 'admin') body.password = password

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al iniciar sesión'); return }
      const from = searchParams.get('from')
      router.push(data.role === 'admin' ? (from && from !== '/login' ? from : '/') : '/portal')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      {/* ── Left panel (desktop only) ── */}
      <div className="hidden md:flex md:w-[45%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #18181b 0%, #09090b 60%, #1c1917 100%)' }}>
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-20 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #fbbf24, transparent 70%)' }} />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-700/50 bg-zinc-900/50 text-zinc-400 text-xs font-medium mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            CBT · Sistema Activo
          </div>
          <h1 className="text-5xl font-black text-white leading-none tracking-tight mb-4">
            Control<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
              Aula
            </span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Sistema de gamificación<br />para el aula inteligente.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { icon: '⚡', label: 'Acciones en tiempo real', desc: 'Premia o penaliza al instante' },
            { icon: '🏆', label: 'Progreso visual', desc: 'Coins, tramos y recompensas' },
            { icon: '👥', label: 'Grupos de trabajo', desc: 'Competencia sana entre equipos' },
          ].map(f => (
            <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/40">
              <span className="text-xl mt-0.5">{f.icon}</span>
              <div>
                <div className="text-zinc-200 text-sm font-medium">{f.label}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        {/* Mobile header */}
        <div className="md:hidden text-center mb-8">
          <div className="text-3xl font-black text-white mb-1">Control<span className="text-amber-400">Aula</span></div>
          <p className="text-zinc-500 text-sm">Sistema de gamificación</p>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Bienvenido</h2>
            <p className="text-zinc-500 text-sm">Selecciona tu rol e ingresa tus datos</p>
          </div>

          {/* Mode toggle */}
          <div className="relative flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-8">
            {/* Sliding indicator */}
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-zinc-700 transition-all duration-300 ease-out ${mode === 'student' ? 'left-1' : 'left-[calc(50%+0px)]'}`} />
            <button type="button" onClick={() => switchMode('student')}
              className={`relative z-10 flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${mode === 'student' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-400'}`}>
              Estudiante
            </button>
            <button type="button" onClick={() => switchMode('admin')}
              className={`relative z-10 flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${mode === 'admin' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-400'}`}>
              Administrador
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {mode === 'student' ? 'Código de estudiante' : 'Usuario'}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg select-none">
                  {mode === 'student' ? '👤' : '🔑'}
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder={mode === 'student' ? 'ej. s1a01' : 'admin'}
                  className="input w-full pl-11 h-12 text-sm"
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
              {mode === 'student' && (
                <p className="text-xs text-zinc-600 pl-1">Tu código de estudiante (ej. s2a05)</p>
              )}
            </div>

            {/* Password field - only admin */}
            {mode === 'admin' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg select-none">🔒</div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input w-full pl-11 h-12 text-sm"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800/50">
                <span className="text-red-400 text-lg">⚠️</span>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-12 rounded-xl text-sm font-bold transition-all duration-200 overflow-hidden disabled:opacity-60"
              style={{
                background: loading ? '#27272a' : 'linear-gradient(135deg, #fbbf24, #d97706)',
                color: loading ? '#71717a' : '#1c1917',
              }}
            >
              {!loading && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #fcd34d, #f59e0b)' }} />
              )}
              <span className="relative z-10">
                {loading ? 'Verificando...' : mode === 'student' ? 'Ingresar al Portal' : 'Ingresar al Panel'}
              </span>
            </button>
          </form>

          <p className="text-center text-zinc-700 text-xs mt-8">
            CBT Control Aula · Sistema privado
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-full max-w-[380px] space-y-4 p-6">
          <div className="h-8 w-40 bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-12 bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-12 bg-zinc-800 rounded-xl animate-pulse" />
          <div className="h-12 bg-zinc-800 rounded-xl animate-pulse" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
