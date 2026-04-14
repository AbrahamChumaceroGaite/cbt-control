import { Camera, LogOut, Users, Trophy } from 'lucide-react'
import { Avatar, Spinner }   from '@/components/ui'
import { DateTimeChip }      from './DateTimeChip'
import { NotificationBell }  from '@/components/shared/NotificationBell'
import { TRAMOS, HERO_BANNER } from '@/config/scheme'
import type { StudentData }  from '../../domain/types'
import type { RefObject }    from 'react'

interface Props {
  student:   StudentData
  uploading: 'avatar' | 'banner' | null
  avatarRef: RefObject<HTMLInputElement>
  bannerRef: RefObject<HTMLInputElement>
  onUploadAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUploadBanner: (e: React.ChangeEvent<HTMLInputElement>) => void
  onLogout:  () => void
}

export function PerfilHero({ student, uploading, avatarRef, bannerRef, onUploadAvatar, onUploadBanner, onLogout }: Props) {
  const latestTramo = student.tramos.at(-1)
  const tramoData   = latestTramo ? TRAMOS.find(t => t.id === latestTramo.tramo) : null

  return (
    <section className="relative w-full h-[420px] sm:h-[480px] overflow-hidden">
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
      <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={onUploadBanner} />

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
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={onUploadAvatar} />
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
  )
}
