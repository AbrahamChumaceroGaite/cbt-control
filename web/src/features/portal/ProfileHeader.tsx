'use client'
import { useRef, useState } from 'react'
import { Camera, Coins, Users, Trophy, BookOpen } from 'lucide-react'
import { portalService, type StudentData } from '@/services/portal.service'

async function resizeImage(file: File, maxW: number, maxH: number, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const ratio = Math.min(maxW / img.width, maxH / img.height, 1)
      const w = Math.round(img.width * ratio)
      const h = Math.round(img.height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Error al cargar imagen')) }
    img.src = url
  })
}

interface Props {
  student: StudentData
  onStudentUpdate: (updated: Partial<StudentData>) => void
}

export function ProfileHeader({ student, onStudentUpdate }: Props) {
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<'avatar' | 'banner' | null>(null)

  const latestTramo = student.tramos.at(-1)?.tramo ?? null
  const initials = student.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('avatar')
    try {
      const avatarUrl = await resizeImage(file, 400, 400, 0.85)
      await portalService.updateProfile({ avatarUrl })
      onStudentUpdate({ avatarUrl })
    } catch { /* silent */ } finally {
      setUploading(null)
      e.target.value = ''
    }
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('banner')
    try {
      const bannerUrl = await resizeImage(file, 1200, 400, 0.80)
      await portalService.updateProfile({ bannerUrl })
      onStudentUpdate({ bannerUrl })
    } catch { /* silent */ } finally {
      setUploading(null)
      e.target.value = ''
    }
  }

  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-32 sm:h-44 w-full overflow-hidden rounded-b-none">
        {student.bannerUrl ? (
          <img src={student.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #1c1400 0%, #2d1f00 40%, #0a0a0a 100%)'
          }}>
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #fbbf24 0%, transparent 50%), radial-gradient(circle at 80% 30%, #d97706 0%, transparent 40%)' }} />
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
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
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
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-black text-amber-400"
                  style={{ background: 'linear-gradient(135deg, #1c1400, #2d1f00)' }}>
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              {uploading === 'avatar' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-zinc-600 border-t-amber-400 animate-spin" />
                </div>
              )}
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Name + course */}
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-lg font-bold text-white leading-tight truncate">{student.name}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{student.course.level} · {student.course.name}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard
            icon={<Coins className="w-4 h-4" />}
            value={student.coins}
            label="Mis coins"
            color="amber"
          />
          <StatCard
            icon={<BookOpen className="w-4 h-4" />}
            value={student.course.classCoins}
            label="Clase"
            color="blue"
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            value={student.groupMemberships.length}
            label="Grupos"
            color="emerald"
          />
          <StatCard
            icon={<Trophy className="w-4 h-4" />}
            value={latestTramo ?? '—'}
            label="Tramo"
            color="purple"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, color }: {
  icon: React.ReactNode
  value: string | number
  label: string
  color: 'amber' | 'blue' | 'emerald' | 'purple'
}) {
  const colors = {
    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400',   icon: 'text-amber-500/60' },
    blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400',    icon: 'text-blue-500/60' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-500/60' },
    purple:  { bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400',  icon: 'text-purple-500/60' },
  }[color]

  return (
    <div className={`rounded-xl border p-2.5 flex flex-col gap-1 ${colors.bg} ${colors.border}`}>
      <div className={`${colors.icon}`}>{icon}</div>
      <div className={`text-base font-black leading-none ${colors.text}`}>{value}</div>
      <div className="text-[10px] text-zinc-600 font-medium leading-none">{label}</div>
    </div>
  )
}
