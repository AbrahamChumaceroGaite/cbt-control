'use client'
import { useRef, useState, useMemo, useEffect } from 'react'
import {
  Camera, ChevronLeft, ChevronRight, CalendarDays, X,
  Coins, BookOpen, Users, Trophy, TrendingUp,
  TrendingDown, Star, Zap, LogOut, Clock,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { portalService, type StudentData, type IndividualReward } from '@/services/portal.service'
import { NotificationBell } from '@/features/notifications/NotificationBell'

// ─── Static tramo data ────────────────────────────────────────────────────────

const TRAMOS = [
  { id: 'T1', label: 'Atención',        color: '#0C447C', fg: '#85B7EB' },
  { id: 'T2', label: 'Indagación',      color: '#3C3489', fg: '#AFA9EC' },
  { id: 'T3', label: 'Metacognición',   color: '#0F6E56', fg: '#5DCAA5' },
  { id: 'T4', label: 'Pens. Analítico', color: '#633806', fg: '#EF9F27' },
  { id: 'T5', label: 'Apz. Autónomo',   color: '#72243E', fg: '#ED93B1' },
  { id: 'T6', label: 'Colaborativo',    color: '#3B6D11', fg: '#97C459' },
  { id: 'T7', label: 'Innovación',      color: '#501313', fg: '#F09595' },
]

const CAT_COLOR: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  green:  { dot: 'bg-green-400',   text: 'text-green-400',   bg: 'bg-green-400/10',   border: 'border-green-400/20' },
  blue:   { dot: 'bg-blue-400',    text: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20' },
  red:    { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20' },
  amber:  { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
  purple: { dot: 'bg-purple-400',  text: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20' },
  mag:    { dot: 'bg-fuchsia-400', text: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/20' },
}
const fallbackCat = { dot: 'bg-zinc-500', text: 'text-zinc-400', bg: 'bg-zinc-700/30', border: 'border-zinc-700/40' }

const PAGE_SIZE = 5

// ─── Image resize (canvas → base64) ─────────────────────────────────────────

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

// ─── Sparkline SVG ───────────────────────────────────────────────────────────

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100
    const y = 30 - ((v - min) / range) * 26
    return `${x},${y}`
  }).join(' L ')
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full">
      <defs>
        <linearGradient id={`sp-${color.replace('#','')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M ${pts} L 100,32 L 0,32 Z`} fill={`url(#sp-${color.replace('#','')})`} />
      <path d={`M ${pts}`} fill="none" stroke={color} strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  )
}

// ─── Coin trajectory chart (Recharts) ────────────────────────────────────────

function TrajectoryChart({ logs, currentCoins }: { logs: StudentData['coinLogs']; currentCoins: number }) {
  const ordered = [...logs].reverse()
  if (ordered.length < 3) return (
    <p className="text-xs text-zinc-600 text-center py-4">Sin suficientes datos</p>
  )

  const cumul  = ordered.map(l => l.coins).reduce<number[]>((a, d) => { a.push((a.at(-1) ?? 0) + d); return a }, [])
  const offset = currentCoins - (cumul.at(-1) ?? 0)
  const series = cumul.map(v => v + offset)
  const trend  = series.at(-1)! >= series[0]
  const diff   = series.at(-1)! - series[0]

  // Thin the data points for chart performance — max 30 ticks
  const step     = Math.max(1, Math.floor(ordered.length / 30))
  const chartData = ordered.filter((_, i) => i % step === 0 || i === ordered.length - 1).map((l, idx) => {
    const origIdx = idx * step < ordered.length ? idx * step : ordered.length - 1
    return {
      date:   new Date(l.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }),
      coins:  series[Math.min(origIdx, series.length - 1)],
      change: ordered[Math.min(origIdx, ordered.length - 1)].coins,
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const change = payload[0]?.payload?.change ?? 0
    return (
      <div className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-2.5 shadow-xl text-xs">
        <p className="text-zinc-400 mb-1">{label}</p>
        <p className="text-amber-400 font-bold">{payload[0]?.value} coins</p>
        {change !== 0 && (
          <p className={`font-semibold ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change > 0 ? '+' : ''}{change}
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {trend ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
          <span className={`text-xs font-bold ${trend ? 'text-green-400' : 'text-red-400'}`}>
            {diff > 0 ? '+' : ''}{diff} coins
          </span>
        </div>
        <span className="text-[10px] text-zinc-600">{ordered.length} eventos</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={trend ? '#4ade80' : '#f87171'} stopOpacity={0.35} />
              <stop offset="95%" stopColor={trend ? '#4ade80' : '#f87171'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(161,161,170,0.6)', fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: 'rgba(161,161,170,0.6)', fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="coins"
            stroke={trend ? '#4ade80' : '#f87171'}
            strokeWidth={2}
            fill="url(#coinGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#fbbf24', stroke: '#1c1c1c', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Weekly reset countdown ───────────────────────────────────────────────────

function useResetCountdown() {
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    function calc() {
      const now   = new Date()
      const day   = now.getDay()
      const daysUntil = day === 1 ? 7 : (1 - day + 7) % 7 || 7
      const next  = new Date(now)
      next.setDate(now.getDate() + daysUntil)
      next.setHours(0, 0, 0, 0)
      const diff  = next.getTime() - now.getTime()
      const d     = Math.floor(diff / 86_400_000)
      const h     = Math.floor((diff % 86_400_000) / 3_600_000)
      const m     = Math.floor((diff % 3_600_000)  / 60_000)
      const s     = Math.floor((diff % 60_000) / 1_000)
      setCountdown(`${String(d).padStart(2,'0')}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  return countdown
}

// ─── Rewards progress list ────────────────────────────────────────────────────

function RewardsProgress({ coins, rewards, pendingIds }: {
  coins: number
  rewards: IndividualReward[]
  pendingIds: Set<string>
}) {
  const countdown = useResetCountdown()

  // Only show rewards NOT yet pending (still achievable this week)
  const sorted = [...rewards]
    .filter(r => !pendingIds.has(r.id))
    .sort((a, b) => a.coinsRequired - b.coinsRequired)

  const nextIdx = sorted.findIndex(r => coins < r.coinsRequired)

  if (!sorted.length) return (
    <p className="text-xs text-zinc-600 text-center py-4">No hay premios pendientes esta semana</p>
  )

  return (
    <div>
      <div className="space-y-4">
        {sorted.map((r, i) => {
          const unlocked = coins >= r.coinsRequired
          const isNext   = i === nextIdx
          const pct      = Math.min(100, Math.round((coins / r.coinsRequired) * 100))
          return (
            <div key={r.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold flex items-center gap-2 ${unlocked ? 'text-amber-300' : isNext ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <span className="text-base leading-none">{r.icon}</span>
                  {r.name}
                  {unlocked && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                  {!unlocked && isNext && <Zap className="w-3 h-3 text-emerald-400" />}
                </span>
                <span className={`font-semibold ${unlocked ? 'text-amber-400' : 'text-zinc-500'}`}>{pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: unlocked ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : isNext ? 'linear-gradient(90deg,#059669,#10b981)' : '#3f3f46',
                    boxShadow: unlocked ? '0 0 8px rgba(251,191,36,0.35)' : isNext ? '0 0 8px rgba(16,185,129,0.25)' : 'none',
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>{coins} / {r.coinsRequired} coins</span>
                {!unlocked && <span>Faltan {r.coinsRequired - coins}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Weekly reset timer */}
      <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">Se resetea en</span>
        <span className="font-mono text-[11px] font-bold text-amber-400/70 tracking-widest">{countdown}</span>
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
  const [open, setOpen] = useState(false)
  const [from, setFrom] = useState(filter?.from ?? '')
  const [to,   setTo]   = useState(filter?.to   ?? '')
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors
          ${filter ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'}`}
      >
        <CalendarDays className="w-3 h-3" />
        {filter ? `${filter.from} → ${filter.to}` : 'Filtrar'}
        {filter && (
          <X className="w-3 h-3 ml-0.5 text-amber-500" onClick={e => { e.stopPropagation(); setFrom(''); setTo(''); onClear(); setOpen(false) }} />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-60 bg-zinc-900 border border-zinc-700/60 rounded-xl shadow-2xl p-3 space-y-3">
          <div className="space-y-1">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider">Desde</label>
            <input type="date" value={from} max={today} onChange={e => setFrom(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-wider">Hasta</label>
            <input type="date" value={to} min={from} max={today} onChange={e => setTo(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setFrom(''); setTo(''); onClear(); setOpen(false) }}
              className="flex-1 h-8 rounded-lg border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
              Limpiar
            </button>
            <button onClick={() => { if (from) { onApply({ from, to: to || today }); setOpen(false) } }} disabled={!from}
              className="flex-1 h-8 rounded-lg bg-amber-500 text-zinc-900 text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-40">
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Current date/time chip ───────────────────────────────────────────────────

function DateTimeChip() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/50 backdrop-blur-xl border border-white/[0.07]">
      <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
      <div>
        <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold leading-none mb-0.5">
          {now.toLocaleDateString('es-BO', { weekday: 'short', day: '2-digit', month: 'short' })}
        </p>
        <p className="font-mono text-xs font-semibold text-white leading-none">
          {now.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  student: StudentData
  rewards: IndividualReward[]
  onStudentUpdate: (partial: Partial<StudentData>) => void
  onLogout: () => void
}

export function PerfilTab({ student, rewards, onStudentUpdate, onLogout }: Props) {
  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const [uploading,   setUploading]   = useState<'avatar' | 'banner' | null>(null)
  const [page,        setPage]        = useState(0)
  const [dateFilter,  setDateFilter]  = useState<DateFilter | null>(null)

  const initials    = student.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const latestTramo = student.tramos.at(-1)
  const tramoData   = latestTramo ? TRAMOS.find(t => t.id === latestTramo.tramo) : null

  // Set of reward IDs with pending requests this week (filter from RewardsProgress)
  const pendingRewardIds = useMemo(() => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)) // last Monday
    weekStart.setHours(0, 0, 0, 0)
    return new Set(
      student.redemptionRequests
        .filter(r => r.status === 'pending' && new Date(r.createdAt) >= weekStart)
        .map(r => r.rewardId)
    )
  }, [student.redemptionRequests])

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

  // Sparkline for "Mis Coins"
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
    try { const avatarUrl = await resizeImage(f, 400, 400); await portalService.updateProfile({ avatarUrl }); onStudentUpdate({ avatarUrl }) }
    catch {} finally { setUploading(null); e.target.value = '' }
  }

  async function uploadBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setUploading('banner')
    try { const bannerUrl = await resizeImage(f, 1200, 500, 0.80); await portalService.updateProfile({ bannerUrl }); onStudentUpdate({ bannerUrl }) }
    catch {} finally { setUploading(null); e.target.value = '' }
  }

  return (
    <div className="pb-28">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[420px] sm:h-[480px] overflow-hidden">

        {/* Banner */}
        <div className="absolute inset-0">
          {student.bannerUrl
            ? <img src={student.bannerUrl} alt="" className="w-full h-full object-cover" />
            : (
              <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0a0800 0%, #1c1400 30%, #2d1f00 55%, #0a0a0a 100%)' }}>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 55%, rgba(251,191,36,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 25%, rgba(217,119,6,0.1) 0%, transparent 45%)' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(0deg, #fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
              </div>
            )}
        </div>

        {/* Banner edit button — always visible, bottom-left */}
        <button
          onClick={() => bannerRef.current?.click()}
          disabled={uploading === 'banner'}
          className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/55 backdrop-blur-sm text-white/80 text-xs font-medium hover:bg-black/70 hover:text-white transition-all border border-white/10"
        >
          <Camera className="w-3 h-3" />
          {uploading === 'banner' ? 'Subiendo…' : 'Cambiar portada'}
        </button>
        <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={uploadBanner} />

        {/* Top-right: notification + logout — with solid bg to stay visible over banner */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <div className="rounded-xl bg-black/55 backdrop-blur-sm border border-white/10 overflow-hidden">
            <NotificationBell />
          </div>
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-xl bg-black/55 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Gradient fade bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent pointer-events-none" />

        {/* Centered identity */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-4">

          {/* Avatar */}
          <div className="relative group cursor-pointer mb-4" onClick={() => avatarRef.current?.click()}>
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-zinc-950/80 shadow-2xl shadow-black/60 overflow-hidden bg-zinc-800">
              {student.avatarUrl
                ? <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-amber-400"
                    style={{ background: 'linear-gradient(135deg, #1c1400, #3d2800)' }}>
                    {initials}
                  </div>
                )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors flex items-center justify-center rounded-full">
                <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {uploading === 'avatar' && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-600 border-t-amber-400 animate-spin" />
                </div>
              )}
            </div>
            {tramoData && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-zinc-950 flex items-center justify-center shadow-lg"
                style={{ background: tramoData.color }}>
                <Trophy className="w-3.5 h-3.5" style={{ color: tramoData.fg }} />
              </div>
            )}
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
          </div>

          {/* Name only — no redundant subtitle */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1 text-center drop-shadow-lg">
            {student.name}
          </h1>
          {tramoData && (
            <p className="text-amber-400 uppercase tracking-[0.22em] font-semibold text-[11px] mb-5">
              {tramoData.id} · {tramoData.label}
            </p>
          )}

          {/* Info chips — date/time + groups */}
          <div className="flex flex-wrap justify-center gap-2.5 w-full max-w-sm">
            <DateTimeChip />
            {student.groupMemberships.slice(0, 2).map(m => (
              <div key={m.group.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/50 backdrop-blur-xl border border-white/[0.07]">
                <Users className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold leading-none mb-0.5">Grupo</p>
                  <p className="text-xs font-semibold text-white leading-none">{m.group.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GRID CONTENT ────────────────────────────────────────────────────── */}
      <main className="px-4 mt-6 max-w-2xl mx-auto space-y-4">

        {/* Row 1: Mis Coins + Coins del Curso */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border-t-2 border-amber-500/60 p-4 group">
            <div className="absolute -right-3 -bottom-3 opacity-[0.07] group-hover:opacity-[0.12] transition-all duration-700 rotate-12 pointer-events-none">
              <Coins className="w-24 h-24 text-amber-400" />
            </div>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(251,191,36,0.08) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 mb-3">Mis Coins</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black tracking-tighter text-amber-400 leading-none">{student.coins}</span>
                <span className="text-amber-500/60 text-xs font-bold mb-0.5">NC</span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {myTrend ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                <span className={`text-[10px] font-bold ${myTrend ? 'text-green-400' : 'text-red-400'}`}>
                  {myTrend ? 'Subiendo' : 'Bajando'}
                </span>
              </div>
              <Sparkline values={mySparkline} color={myTrend ? '#4ade80' : '#f87171'} />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border-t-2 border-emerald-500/60 p-4 group">
            <div className="absolute -right-3 -bottom-3 opacity-[0.07] group-hover:opacity-[0.12] transition-all duration-700 -rotate-12 pointer-events-none">
              <BookOpen className="w-24 h-24 text-emerald-400" />
            </div>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 mb-3">Clase {student.course.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black tracking-tighter text-emerald-400 leading-none">{student.course.classCoins}</span>
                <span className="text-emerald-500/60 text-xs font-bold mb-0.5">NC</span>
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">coins grupales acumulados</p>
            </div>
          </div>
        </div>

        {/* Row 2: Trajectory chart */}
        {student.coinLogs.length >= 3 && (
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/60 p-4">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 mb-3">Trayectoria de Coins</p>
            <TrajectoryChart logs={student.coinLogs} currentCoins={student.coins} />
          </div>
        )}

        {/* Row 3: Rewards progress */}
        {rewards.length > 0 && (
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/60 p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">Próximos Premios</p>
              <Star className="w-3.5 h-3.5 text-amber-500/60" />
            </div>
            <RewardsProgress coins={student.coins} rewards={rewards} pendingIds={pendingRewardIds} />
          </div>
        )}

        {/* Row 4: Historial */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">Historial</p>
              {filteredLogs.length > 0 && (
                <span className="text-[10px] text-zinc-600">{filteredLogs.length} registros</span>
              )}
            </div>
            <DateFilterPopover
              filter={dateFilter}
              onApply={f => { setDateFilter(f); setPage(0) }}
              onClear={() => { setDateFilter(null); setPage(0) }}
            />
          </div>

          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
                <Coins className="w-4 h-4 text-zinc-600" />
              </div>
              <p className="text-xs text-zinc-600">Sin movimientos{dateFilter ? ' en ese período' : ''}</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-zinc-800/40">
                {pagedLogs.map(log => {
                  const cat = log.action?.category ?? ''
                  const c   = CAT_COLOR[cat] ?? fallbackCat
                  const pos = log.coins >= 0
                  return (
                    <div key={log.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors group">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${c.bg} ${c.border}`}>
                        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200 font-semibold truncate leading-tight">{log.action?.name ?? log.reason}</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                          {new Date(log.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-base font-black ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pos ? '+' : ''}{log.coins}
                        </span>
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{pos ? 'Coins' : 'Spent'}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800/60">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-zinc-500">{page + 1} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
