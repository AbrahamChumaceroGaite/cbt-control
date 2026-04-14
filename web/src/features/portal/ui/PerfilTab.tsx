'use client'
import { useState, useMemo } from 'react'
import { Star }              from 'lucide-react'
import { TrajectoryChart }   from './components/TrajectoryChart'
import { RewardsProgress }   from './components/RewardsProgress'
import { PerfilHero }        from './components/PerfilHero'
import { CoinStatsCards }    from './components/CoinStatsCards'
import { CoinHistory }       from './components/CoinHistory'
import { usePerfilTab }      from '../application/usePerfilTab'
import type { StudentData, IndividualReward, DateFilter } from '../domain/types'
import { REQUEST_STATUS }    from '@/config/status'

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
      <PerfilHero
        student={student} uploading={uploading}
        avatarRef={avatarRef} bannerRef={bannerRef}
        onUploadAvatar={uploadAvatar} onUploadBanner={uploadBanner}
        onLogout={onLogout}
      />

      <main className="px-4 mt-6 max-w-2xl mx-auto space-y-4">
        <CoinStatsCards
          coins={student.coins} courseCoins={student.course.classCoins}
          courseName={student.course.name}
          sparkline={mySparkline} trending={myTrend}
        />

        {student.coinLogs.length >= 3 && (
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/60 p-4">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500 mb-3">Coins Trajectory</p>
            <TrajectoryChart logs={student.coinLogs} currentCoins={student.coins} />
          </div>
        )}

        {rewards.length > 0 && (
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/60 p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">Upcoming Rewards</p>
              <Star className="w-3.5 h-3.5 text-amber-500/60" />
            </div>
            <RewardsProgress coins={student.coins} rewards={rewards} pendingIds={pendingRewardIds} />
          </div>
        )}

        <CoinHistory
          filteredLogs={filteredLogs} pagedLogs={pagedLogs}
          page={page} totalPages={totalPages} dateFilter={dateFilter}
          onPageChange={setPage}
          onFilterApply={f => { setDateFilter(f); setPage(0) }}
          onFilterClear={() => { setDateFilter(null); setPage(0) }}
        />
      </main>
    </div>
  )
}
