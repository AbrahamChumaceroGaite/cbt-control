'use client'
import { useRef, useState, useMemo } from 'react'
import {
  Camera, ChevronLeft, ChevronRight,
  CalendarDays, X, Lock, Coins, BookOpen,
  Users, Trophy, TrendingUp, TrendingDown, Gift,
} from 'lucide-react'
import { portalService, type StudentData, type IndividualReward } from '@/services/portal.service'

// ─── Static data ──────────────────────────────────────────────────────────────

const TRAMOS = [
  { id: 'T1', label: 'Atención',        color: '#0C447C', fg: '#85B7EB' },
  { id: 'T2', label: 'Indagación',      color: '#3C3489', fg: '#AFA9EC' },
  { id: 'T3', label: 'Metacognición',   color: '#0F6E56', fg: '#5DCAA5' },
  { id: 'T4', label: 'Pens. Analítico', color: '#633806', fg: '#EF9F27' },
  { id: 'T5', label: 'Apz. Autónomo',   color: '#72243E', fg: '#ED93B1' },
  { id: 'T6', label: 'Colaborativo',    color: '#3B6D11', fg: '#97C459' },
  { id: 'T7', label: 'Innovación',      color: '#501313', fg: '#F09595' },
]

const CAT_DOT: Record<string, string> = {
  green: 'bg-green-400', blue: 'bg-blue-400', red: 'bg-red-400',
  amber: 'bg-amber-400', purple: 'bg-purple-400', mag: 'bg-fuchsia-400',
}
const CAT_TEXT: Record<string, string> = {
  green: 'text-green-400', blue: 'text-blue-400', red: 'text-red-400',
  amber: 'text-amber-400', purple: 'text-purple-400', mag: 'text-fuchsia-400',
}

const PAGE_SIZE = 10

// ─── Image resize ─────────────────────────────────────────────────────────────

async function resizeImage(file: File, maxW: number, maxH: number, q = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', q))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject() }
    img.src = url
  })
}

// ─── Coin sparkline (SVG inline) ──────────────────────────────────────────────

function CoinSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100
    const y = 36 - ((v - min) / range) * 32
    return `${x},${y}`
  }).join(' L ')
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-10 w-full">
      <defs>
        <linearGradient id={`sg-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${pts} L 100,40 L 0,40 Z`} fill={`url(#sg-${color})`} />
      <path d={`M ${pts}`} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  )
}

// ─── Full coin trajectory chart ───────────────────────────────────────────────

function CoinTrajectoryChart({ logs, currentCoins }: {
  logs: StudentData['coinLogs']
  currentCoins: number
}) {
  // reverse to oldest-first, build running balance ending at currentCoins
  const ordered = [...logs].reverse()
  if (ordered.length < 2) return (
    <div className="flex items-center justify-center h-20 text-xs text-zinc-600">Sin suficientes datos para graficar</div>
  )
  const deltas    = ordered.map(l => l.coins)
  const cumul     = deltas.reduce<number[]>((a, d) => { a.push((a.at(-1) ?? 0) + d); return a }, [])
  const offset    = currentCoins - (cumul.at(-1) ?? 0)
  const series    = cumul.map(v => v + offset)
  const minV      = Math.min(...series)
  const maxV      = Math.max(...series)
  const rangeV    = maxV - minV || 1
  const H         = 72
  const W         = 100
  const toXY = (i: number, v: number) => ({
    x: (i / (series.length - 1)) * W,
    y: H - ((v - minV) / rangeV) * (H - 4) - 2,
  })

  // Build colored segments
  const segments: { pts: string; color: string }[] = []
  for (let i = 0; i < series.length - 1; i++) {
    const a = toXY(i, series[i])
    const b = toXY(i + 1, series[i + 1])
    const rising = series[i + 1] >= series[i]
    segments.push({ pts: `M ${a.x},${a.y} L ${b.x},${b.y}`, color: rising ? '#4ade80' : '#f87171' })
  }

  const first = toXY(0, series[0])
  const last  = toXY(series.length - 1, series.at(-1)!)
  const trend = series.at(-1)! >= series[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Trayectoria de coins</span>
          <div className="flex items-center gap-1 mt-0.5">
            {trend
              ? <TrendingUp className="w-3 h-3 text-green-400" />
              : <TrendingDown className="w-3 h-3 text-red-400" />}
            <span className={`text-xs font-bold ${trend ? 'text-green-400' : 'text-red-400'}`}>
              {trend ? '+' : ''}{(series.at(-1)! - series[0])} vs inicio
            </span>
          </div>
        </div>
        <span className="text-[10px] text-zinc-600">{ordered.length} eventos</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-16">
        {segments.map((s, i) => (
          <path key={i} d={s.pts} fill="none" stroke={s.color} strokeWidth="2"
            strokeLinecap="round" opacity="0.85" />
        ))}
        <circle cx={last.x} cy={last.y} r="2.5" fill="#fbbf24" />
      </svg>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-zinc-600">
          {new Date(ordered[0].createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
        </span>
        <span className="text-[10px] text-zinc-600">Hoy</span>
      </div>
    </div>
  )
}

// ─── Battle pass rewards strip ────────────────────────────────────────────────

function RewardsProgressStrip({ coins, rewards }: { coins: number; rewards: IndividualReward[] }) {
  const sorted = [...rewards]
    .filter(r => r.isActive)
    .sort((a, b) => a.coinsRequired - b.coinsRequired)
    .slice(0, 8)

  if (sorted.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Próximos Premios</span>
        <span className="text-[10px] text-amber-400 font-bold">{coins} coins</span>
      </div>
      <div className="relative">
        {/* Progress track */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-zinc-800" />
        <div className="flex items-start justify-between gap-1 relative z-10">
          {sorted.map((r, i) => {
            const unlocked = coins >= r.coinsRequired
            const isNext = !unlocked && (i === 0 || coins >= sorted[i - 1].coinsRequired)
            return (
              <div key={r.id} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center text-lg
                  border transition-all duration-300 relative
                  ${unlocked
                    ? 'bg-amber-500/20 border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                    : isNext
                      ? 'bg-zinc-800 border-zinc-600 animate-pulse'
                      : 'bg-zinc-900 border-zinc-800 opacity-50'}
                `}>
                  {r.icon}
                  {!unlocked && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <Lock className="w-2 h-2 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-[9px] font-medium leading-tight truncate w-full px-0.5 ${unlocked ? 'text-amber-400' : 'text-zinc-600'}`}>
                    {r.coinsRequired}🪙
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Date filter popover ──────────────────────────────────────────────────────

interface DateFilter { from: string; to: string }

function DateFilterPopover({ filter, onApply, onClear }: {
  filter: DateFilter | null
  onApply: (f: DateFilter) => void
  onClear: () => void
}) {
  const [open, setOpen]   = useState(false)
  const [from, setFrom]   = useState(filter?.from ?? '')
  const [to,   setTo]     = useState(filter?.to   ?? '')
  const today = new Date().toISOString().slice(0, 10)

  function apply() {
    if (from) { onApply({ from, to: to || today }); setOpen(false) }
  }
  function clear() { setFrom(''); setTo(''); onClear(); setOpen(false) }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors
          ${filter
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'}`}
      >
        <CalendarDays className="w-3 h-3" />
        {filter ? `${filter.from} → ${filter.to}` : 'Filtrar fecha'}
        {filter && <X className="w-3 h-3 ml-0.5 text-amber-500" onClick={e => { e.stopPropagation(); clear() }} />}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-64 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-3 space-y-3">
          <div className="space-y-1.5">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider">Desde</label>
            <input type="date" value={from} max={today} onChange={e => setFrom(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-zinc-500" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider">Hasta</label>
            <input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-zinc-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={clear} className="flex-1 h-8 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
              Limpiar
            </button>
            <button onClick={apply} disabled={!from}
              className="flex-1 h-8 rounded-lg bg-amber-500 text-zinc-900 text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-40">
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  student: StudentData
  rewards: IndividualReward[]
  onStudentUpdate: (partial: Partial<StudentData>) => void
}

export function PerfilTab({ student, rewards, onStudentUpdate }: Props) {
  const avatarRef  = useRef<HTMLInputElement>(null)
  const bannerRef  = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<'avatar' | 'banner' | null>(null)
  const [page,      setPage]      = useState(0)
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null)

  const initials     = student.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const unlockedTramos = student.tramos.map(t => t.tramo)
  const latestTramo    = student.tramos.at(-1)
  const tramoData      = latestTramo ? TRAMOS.find(t => t.id === latestTramo.tramo) : null

  // Filtered + paginated logs
  const filteredLogs = useMemo(() => {
    if (!dateFilter) return student.coinLogs
    const from = new Date(dateFilter.from).getTime()
    const to   = new Date(dateFilter.to + 'T23:59:59').getTime()
    return student.coinLogs.filter(l => {
      const t = new Date(l.createdAt).getTime()
      return t >= from && t <= to
    })
  }, [student.coinLogs, dateFilter])

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE)
  const pagedLogs  = filteredLogs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Sparkline data for stat cards (last 14 entries cumulative)
  const mySparkline = useMemo(() => {
    const rev = [...student.coinLogs].reverse().slice(-14)
    const cum = rev.reduce<number[]>((a, l) => { a.push((a.at(-1) ?? 0) + l.coins); return a }, [])
    const off = student.coins - (cum.at(-1) ?? 0)
    return cum.map(v => v + off)
  }, [student.coinLogs, student.coins])

  const myTrend = mySparkline.length > 1 && mySparkline.at(-1)! >= mySparkline[0]

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setUploading('avatar')
    try {
      const avatarUrl = await resizeImage(f, 400, 400)
      await portalService.updateProfile({ avatarUrl })
      onStudentUpdate({ avatarUrl })
    } catch {} finally { setUploading(null); e.target.value = '' }
  }

  async function uploadBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setUploading('banner')
    try {
      const bannerUrl = await resizeImage(f, 1200, 400, 0.80)
      await portalService.updateProfile({ bannerUrl })
      onStudentUpdate({ bannerUrl })
    } catch {} finally { setUploading(null); e.target.value = '' }
  }

  return (
    <div className="pb-28">

      {/* ── Cover Banner ── */}
      <div className="relative">
        <div
          className="relative h-40 sm:h-52 w-full overflow-hidden cursor-pointer group"
          onClick={() => bannerRef.current?.click()}
        >
          {student.bannerUrl
            ? <img src={student.bannerUrl} alt="" className="w-full h-full object-cover" />
            : (
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, #1c1400 0%, #3d2800 35%, #1a0f00 65%, #0a0a0a 100%)'
              }}>
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(ellipse at 25% 60%, rgba(251,191,36,0.18) 0%, transparent 55%), radial-gradient(ellipse at 75% 30%, rgba(217,119,6,0.12) 0%, transparent 50%)'
                }} />
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{ backgroundImage: 'linear-gradient(45deg, #fff 1px, transparent 1px), linear-gradient(-45deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              </div>
            )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm text-white/0 group-hover:text-white/80 transition-all text-xs font-medium gap-1">
            <Camera className="w-3 h-3" />
            {uploading === 'banner' ? 'Subiendo...' : 'Cambiar portada'}
          </div>
        </div>
        <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={uploadBanner} />

        {/* Gradient fade at bottom of banner */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
      </div>

      {/* ── Avatar + Name row ── */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-end gap-4 mb-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => avatarRef.current?.click()}>
            <div className="w-24 h-24 rounded-2xl border-4 border-zinc-950 overflow-hidden bg-zinc-800 shadow-xl shadow-black/40">
              {student.avatarUrl
                ? <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-amber-400"
                    style={{ background: 'linear-gradient(135deg, #1c1400, #3d2800)' }}>
                    {initials}
                  </div>
                )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {uploading === 'avatar' && (
                <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-600 border-t-amber-400 animate-spin" />
                </div>
              )}
            </div>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
          </div>

          {/* Name + info */}
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-xl font-black text-white leading-tight truncate">{student.name}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{student.course.level} · Curso {student.course.name}</p>
            {/* Info pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {student.groupMemberships.slice(0, 2).map(m => (
                <span key={m.group.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700/60 text-[10px] text-zinc-400">
                  <Users className="w-2.5 h-2.5" />{m.group.name}
                </span>
              ))}
              {tramoData && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold"
                  style={{ background: tramoData.color + '33', borderColor: tramoData.color + '66', color: tramoData.fg }}>
                  <Trophy className="w-2.5 h-2.5" />{tramoData.id} · {tramoData.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Mis Coins */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-zinc-900/80 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-[0.06] pointer-events-none">
              <Coins className="w-full h-full text-amber-400" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Mis Coins</span>
            </div>
            <div className="text-3xl font-black text-amber-400 leading-none mb-0.5">{student.coins}</div>
            <div className="flex items-center gap-1 mb-1">
              {myTrend
                ? <TrendingUp className="w-3 h-3 text-green-400" />
                : <TrendingDown className="w-3 h-3 text-red-400" />}
              <span className={`text-[10px] font-medium ${myTrend ? 'text-green-400' : 'text-red-400'}`}>
                {myTrend ? 'Subiendo' : 'Bajando'}
              </span>
            </div>
            <CoinSparkline values={mySparkline} color={myTrend ? '#4ade80' : '#f87171'} />
          </div>

          {/* Coins de clase */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-zinc-900/80 p-4">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-[0.06] pointer-events-none">
              <BookOpen className="w-full h-full text-blue-400" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Clase {student.course.name}</span>
            </div>
            <div className="text-3xl font-black text-blue-400 leading-none mb-0.5">{student.course.classCoins}</div>
            <div className="text-[10px] text-zinc-600 mt-1">coins grupales acumulados</div>
          </div>
        </div>

        {/* ── Coin trajectory chart ── */}
        {student.coinLogs.length >= 3 && (
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-4 mb-3">
            <CoinTrajectoryChart logs={student.coinLogs} currentCoins={student.coins} />
          </div>
        )}

        {/* ── Battle pass rewards ── */}
        {rewards.length > 0 && (
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-4 mb-3">
            <RewardsProgressStrip coins={student.coins} rewards={rewards} />
          </div>
        )}

        {/* ── Historial ── */}
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
            <div>
              <span className="text-xs font-semibold text-zinc-300">Historial</span>
              {filteredLogs.length > 0 && (
                <span className="ml-2 text-[10px] text-zinc-600">{filteredLogs.length} registros</span>
              )}
            </div>
            <DateFilterPopover
              filter={dateFilter}
              onApply={f => { setDateFilter(f); setPage(0) }}
              onClear={() => { setDateFilter(null); setPage(0) }}
            />
          </div>

          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
                <Gift className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500">Sin movimientos{dateFilter ? ' en ese período' : ''}</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-zinc-800/40">
                {pagedLogs.map(log => {
                  const cat = log.action?.category ?? ''
                  const dot = CAT_DOT[cat] ?? 'bg-zinc-600'
                  const amt = CAT_TEXT[cat] ?? 'text-zinc-400'
                  return (
                    <div key={log.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/20 transition-colors">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-300 truncate leading-tight">{log.action?.name ?? log.reason}</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                          {new Date(log.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`text-sm font-bold flex-shrink-0 ${log.coins >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {log.coins > 0 ? '+' : ''}{log.coins}
                      </span>
                    </div>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800/60">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-zinc-500">{page + 1} / {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
