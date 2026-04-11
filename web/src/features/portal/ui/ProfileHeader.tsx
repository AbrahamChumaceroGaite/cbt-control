'use client'
import { Camera, Coins, Users, Trophy, BookOpen } from 'lucide-react'
import { Avatar }                from '@/components/ui'
import { usePerfilTab }          from '../application/usePerfilTab'
import { BANNER_GRADIENT, STAT_CARD } from '@/config/scheme'
import type { StatCardColor }         from '@/config/scheme'
import type { StudentData }      from '../domain/types'

interface Props {
  student: StudentData
  onStudentUpdate: (updated: Partial<StudentData>) => void
}

export function ProfileHeader({ student, onStudentUpdate }: Props) {
  const { uploading, avatarRef: avatarInputRef, bannerRef: bannerInputRef, uploadAvatar, uploadBanner } = usePerfilTab(onStudentUpdate)

  const latestTramo = student.tramos.at(-1)?.tramo ?? null

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-32 sm:h-44 w-full overflow-hidden rounded-b-none">
        {student.bannerUrl ? (
          <img src={student.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: BANNER_GRADIENT.base }}>
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: BANNER_GRADIENT.overlay }} />
          </div>
        )}
        {/* Banner upload button */}
        <button
          onClick={() => bannerInputRef.current?.click()}
          disabled={uploading === 'banner'}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 text-xs font-medium hover:bg-black/60 transition-colors"
        >
          <Camera className="w-3 h-3" />
          {uploading === 'banner' ? 'Subiendo...' : 'Portada'}
        </button>
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={uploadBanner} />
      </div>

      {/* Avatar + name row */}
      <div className="px-4 pb-4 bg-zinc-950 relative">
        <div className="flex items-end gap-4 -mt-10 mb-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploading === 'avatar'}
              className="group relative w-20 h-20 rounded-2xl border-4 border-zinc-950 overflow-hidden bg-zinc-800 focus:outline-none"
            >
              <Avatar name={student.name} src={student.avatarUrl ?? undefined} className="w-full h-full rounded-none" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
          </div>

          {/* Name + course */}
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-lg font-bold text-white leading-tight truncate">{student.name}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{student.course.level} · {student.course.name}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard icon={<Coins className="w-4 h-4" />} value={student.coins} label="Mis coins" color="amber" />
          <StatCard icon={<BookOpen className="w-4 h-4" />} value={student.course.classCoins} label="Clase" color="blue" />
          <StatCard icon={<Users className="w-4 h-4" />} value={student.groupMemberships.length} label="Grupos" color="emerald" />
          <StatCard icon={<Trophy className="w-4 h-4" />} value={latestTramo ?? '—'} label="Tramo" color="purple" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, color }: {
  icon:  React.ReactNode
  value: string | number
  label: string
  color: StatCardColor
}) {
  const colors = STAT_CARD[color]

  return (
    <div className={`rounded-xl border p-2.5 flex flex-col gap-1 ${colors.bg} ${colors.border}`}>
      <div className={`${colors.icon}`}>{icon}</div>
      <div className={`text-base font-black leading-none ${colors.text}`}>{value}</div>
      <div className="text-[10px] text-zinc-600 font-medium leading-none">{label}</div>
    </div>
  )
}
