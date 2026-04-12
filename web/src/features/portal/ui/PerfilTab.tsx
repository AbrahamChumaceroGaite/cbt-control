'use client'
import { useState, useMemo } from 'react'
import {
  Camera, ChevronLeft, ChevronRight,
  Coins, BookOpen, Users, Trophy,
  TrendingUp, TrendingDown, Star, LogOut,
} from 'lucide-react'
import { Avatar, Spinner }      from '@/components/ui'
import { DateFilterPopover }    from './components/DateFilterPopover'
import { TrajectoryChart }      from './components/TrajectoryChart'
import { RewardsProgress }      from './components/RewardsProgress'
import { DateTimeChip }         from './components/DateTimeChip'
import { Sparkline }            from './components/Sparkline'
import { NotificationBell }     from '@/components/shared/NotificationBell'
import { usePerfilTab }         from '../application/usePerfilTab'
import type { StudentData, IndividualReward, DateFilter } from '../domain/types'
import { REQUEST_STATUS }                                               from '@/config/status'
import { ACTION_CATEGORY, ACTION_CATEGORY_FALLBACK, TRAMOS, HERO_BANNER, TREND_HEX } from '@/config/scheme'

const PAGE_SIZE = 5

interface Props {
  student: StudentData
  rewards: IndividualReward[]
  onStudentUpdate: (partial: Partial<StudentData>) => void
  onLogout: () => void
}

export function PerfilTab({ student, rewards, onStudentUpdate, onLogout }: Props) {
  const { uploading, avatarRef, bannerRef, uploadAvatar, uploadBanner } = usePerfilTab(onStudentUpdate)
  const [page,       setPage]       = useState(0)
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null)

  const latestTramo = student.tramos.at(-1)
  const tramoData   = latestTramo ? TRAMOS.find(t => t.id === latestTramo.tramo) : null

  const pendingRewardIds = useMemo(() => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
    weekStart.setHours(0, 0, 0, 0)
    return new Set(
      student.redemptionRequests
        .filter(r => r.status === REQUEST_STATUS.PENDING && new Date(r.createdAt) >= weekStart)
        .map(r => r.rewardId)
    )
  }, [student.redemptionRequests])

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

  const mySparkline = useMemo(() => {
    const rev = [...student.coinLogs].reverse().slice(-14)
    const cum = rev.reduce<number[]>((a, l) => { a.push((a.at(-1) ?? 0) + l.coins); return a }, [])
    const off = student.coins - (cum.at(-1) ?? 0)
    return cum.map(v => v + off)
  }, [student.coinLogs, student.coins])
  const myTrend = mySparkline.length > 1 && mySparkline.at(-1)! >= mySparkline[0]

  return (
    <div className="pb-28">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[420px] sm:h-[480px] overflow-hidden">

        {/* Banner */}
        <div className="absolute inset-0">
          {student.bannerUrl
            ? <img src={student.bannerUrl} alt="" className="w-full h-full object-cover" />
            : (
              <div className="absolute inset-0" style={{ background: HERO_BANNER.base }}>
                <div className="absolute inset-0" style={{ backgroundImage: HERO_BANNER.overlay }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: HERO_BANNER.grid, backgroundSize: HERO_BANNER.gridSize }} />
              </div>
            )}
        </div>

        <button
          onClick={() => bannerRef.current?.click()}
          disabled={uploading === 'banner'}
          className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/55 backdrop-blur-sm text-white/80 text-xs font-medium hover:bg-black/70 hover:text-white transition-all border border-white/10"
        >
          <Camera className="w-3 h-3" />
          {uploading === 'banner' ? 'Uploading…' : 'Change cover'}
        </button>
        <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={uploadBanner} />

        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <div className="rounded-xl bg-black/55 backdrop-blur-sm border border-white/10">
            <NotificationBell />
          </div>
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-xl bg-black/55 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent pointer-events-none" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-4">
          <div className="relative group cursor-pointer mb-4" onClick={() => avatarRef.current?.click()}>
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-zinc-950/80 shadow-2xl shadow-black/60 overflow-hidden bg-zinc-800">
              <Avatar name={student.name} src={student.avatarUrl ?? undefined} className="w-full h-full rounded-none" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors flex items-center justify-center rounded-full">
                <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {uploading === 'avatar' && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <Spinner size="sm" />
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

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1 text-center drop-shadow-lg">
            {student.name}
          </h1>
          {tramoData && (
            <p className="text-amber-400 uppercase tracking-[0.22em] font-semibold text-[11px] mb-5">
              {tramoData.id} · {tramoData.label}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2.5 w-full max-w-sm">
            <DateTimeChip />
            {student.groupMemberships.slice(0, 2).map(m => (
              <div key={m.group.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/50 backdrop-blur-xl border border-white/[0.07]">
                <Users className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold leading-none mb-0.5">Group</p>
                  <p className="text-xs font-semibold text-white leading-none">{m.group.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GRID CONTENT ──────────────────────────────────────────────────── */}
      <main className="px-4 mt-6 max-w-2xl mx-auto space-y-4">

        {/* Coins cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border-t-2 border-amber-500/60 p-4 group">
            <div className="absolute -right-3 -bottom-3 opacity-[0.07] group-hover:opacity-[0.12] transition-all duration-700 rotate-12 pointer-events-none">
              <Coins className="w-24 h-24 text-amber-400" />
            </div>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: HERO_BANNER.amberGlow }} />
            <div className="relative z-10">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 mb-3">My Coins</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black tracking-tighter text-amber-400 leading-none">{student.coins}</span>
                <span className="text-amber-500/60 text-xs font-bold mb-0.5">NC</span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {myTrend ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                <span className={`text-[10px] font-bold ${myTrend ? 'text-green-400' : 'text-red-400'}`}>
                  {myTrend ? 'Rising' : 'Falling'}
                </span>
              </div>
              <Sparkline values={mySparkline} color={myTrend ? TREND_HEX.up : TREND_HEX.down} />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-zinc-900/80 border-t-2 border-emerald-500/60 p-4 group">
            <div className="absolute -right-3 -bottom-3 opacity-[0.07] group-hover:opacity-[0.12] transition-all duration-700 -rotate-12 pointer-events-none">
              <BookOpen className="w-24 h-24 text-emerald-400" />
            </div>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: HERO_BANNER.emeraldGlow }} />
            <div className="relative z-10">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 mb-3">Class {student.course.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black tracking-tighter text-emerald-400 leading-none">{student.course.classCoins}</span>
                <span className="text-emerald-500/60 text-xs font-bold mb-0.5">NC</span>
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">class coins accumulated</p>
            </div>
          </div>
        </div>

        {/* Trajectory chart */}
        {student.coinLogs.length >= 3 && (
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/60 p-4">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 mb-3">Coins Trajectory</p>
            <TrajectoryChart logs={student.coinLogs} currentCoins={student.coins} />
          </div>
        )}

        {/* Rewards progress */}
        {rewards.length > 0 && (
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/60 p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">Upcoming Rewards</p>
              <Star className="w-3.5 h-3.5 text-amber-500/60" />
            </div>
            <RewardsProgress coins={student.coins} rewards={rewards} pendingIds={pendingRewardIds} />
          </div>
        )}

        {/* Historial */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">History</p>
              {filteredLogs.length > 0 && (
                <span className="text-[10px] text-zinc-600">{filteredLogs.length} records</span>
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
              <p className="text-xs text-zinc-600">No movements{dateFilter ? ' in that period' : ''}</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-zinc-800/40">
                {pagedLogs.map(log => {
                  const cat = log.action?.category ?? ''
                  const c   = ACTION_CATEGORY[cat as keyof typeof ACTION_CATEGORY] ?? ACTION_CATEGORY_FALLBACK
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
