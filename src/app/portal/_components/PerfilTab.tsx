import { cn } from '@/lib/utils'
import type { StudentData } from './types'

const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  green:  { text: '#4ade80', bg: '#052e16' },
  blue:   { text: '#60a5fa', bg: '#0c1a3d' },
  red:    { text: '#f87171', bg: '#3b0000' },
  amber:  { text: '#fbbf24', bg: '#2d1a00' },
  purple: { text: '#c084fc', bg: '#2d0052' },
  mag:    { text: '#e879f9', bg: '#330030' },
}

interface PerfilTabProps {
  student: StudentData
}

export function PerfilTab({ student }: PerfilTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Coins hero */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/60 p-6"
        style={{ background: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(#fbbf24, transparent)' }} />
        <div className="relative z-10">
          <div className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">Mis Coins</div>
          <div className="text-6xl font-black text-amber-400 mb-1">{student.coins}</div>
          <div className="text-zinc-600 text-sm">coins acumulados</div>
        </div>
      </div>

      {/* Course coins */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800/60 rounded-2xl px-5 py-4">
        <div>
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Curso {student.course.name}</div>
          <div className="text-sm text-zinc-300">Coins grupales</div>
        </div>
        <div className="text-3xl font-black text-blue-400">{student.course.classCoins}</div>
      </div>

      {/* Groups */}
      {student.groupMemberships.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl px-5 py-4">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">Mis Grupos</div>
          <div className="flex flex-wrap gap-2">
            {student.groupMemberships.map(m => (
              <div key={m.group.id} className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300">
                <span>👥</span> {m.group.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent history */}
      <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800/60">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Historial reciente</div>
        </div>
        {student.coinLogs.length === 0 ? (
          <div className="px-5 py-8 text-center text-zinc-600 text-sm">Sin movimientos aún</div>
        ) : (
          <div className="divide-y divide-zinc-800/40">
            {student.coinLogs.map(log => {
              const cat = log.action?.category ?? ''
              const col = CATEGORY_COLORS[cat] ?? { text: '#a1a1aa', bg: '#18181b' }
              return (
                <div key={log.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col.text }} />
                    <div className="min-w-0">
                      <div className="text-sm text-zinc-300 truncate">{log.action?.name ?? log.reason}</div>
                      <div className="text-xs text-zinc-600 mt-0.5">
                        {new Date(log.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className={`text-base font-bold ml-4 shrink-0 ${log.coins >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {log.coins > 0 ? '+' : ''}{log.coins}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
