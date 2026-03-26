'use client'
import { useState } from 'react'
import { Plus, Users, TrendingUp, Trophy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACTION_COLORS } from '@/lib/types'
import type { Course, Student, Action, Reward, Log } from '@/lib/types'
import { Modal } from './Modal'

interface AulaSectionProps {
  course: Course | undefined
  students: Student[]
  actions: Action[]
  rewards: Reward[]
  logs: Log[]
  reload: () => void
  showToast: (msg: string, ok?: boolean) => void
}

export function AulaSection({ course, students, actions, rewards, logs, reload, showToast }: AulaSectionProps) {
  const [awardModal, setAwardModal] = useState(false)
  const [claimModal, setClaimModal] = useState<{ reward: Reward; student?: Student } | null>(null)
  const [awardTarget, setAwardTarget] = useState<'class' | string>('class')

  const topStudents    = [...(students || [])].sort((a, b) => b.coins - a.coins).slice(0, 5)
  const activeActions  = (actions  || []).filter(a => a.isActive)
  const classRewards   = (rewards  || []).filter(r => r.type === 'class' && r.isActive).sort((a, b) => a.coinsRequired - b.coinsRequired)
  const individualRewards = (rewards || []).filter(r => r.type === 'individual' && r.isActive).sort((a, b) => a.coinsRequired - b.coinsRequired)
  const timelineRewards = [
    { id: 'start', name: 'Inicio de Curso', coinsRequired: 0, icon: '🚀', isGlobal: true, isActive: true } as Reward,
    ...classRewards,
  ]
  const currentCoins   = course?.classCoins ?? 0
  const nextReward     = classRewards.find(r => r.coinsRequired > currentCoins)

  async function awardCoins(amount: number, reason: string, actionId?: string) {
    const studentId = awardTarget === 'class' ? undefined : awardTarget
    const res = await fetch('/api/puntos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: course!.id, studentId, actionId, coins: amount, reason }),
    })
    if (res.ok) { showToast(`${amount > 0 ? '+' : ''}${amount} coins — ${reason}`, amount > 0); setAwardModal(false); reload() }
  }

  async function claimReward() {
    if (!claimModal) return
    const { reward, student: s } = claimModal
    const body = s
      ? { courseId: course!.id, studentId: s.id, points: 0, reason: `🎁 Canjeado: ${reward.name}` }
      : { courseId: course!.id, points: 0, reason: `🎁 Canjeado: ${reward.name}` }
    const res = await fetch('/api/puntos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { showToast(`¡Se ha reclamado: ${reward.name}!`); setClaimModal(null); reload() }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Clase Activa</h2>
          <p className="text-zinc-400 text-sm mt-1">Sigue el progreso de {course?.name || 'la clase'} en la línea de tiempo de recompensas.</p>
        </div>
        <button className="btn btn-action-primary px-5 py-2.5 rounded-full shadow-lg shadow-blue-900/20" onClick={() => setAwardModal(true)}>
          <Plus size={16} className="mr-2" /> Otorgar Coins
        </button>
      </div>

      {/* Class Goal Timeline */}
      <div className="card-base p-6 relative group overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-emerald-500/10 transition-all" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 relative z-10 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Trophy size={20} className="text-amber-500" /> Gran Ruta de Recompensas</h3>
            <p className="text-sm font-medium mt-1 text-zinc-300">
              {nextReward
                ? <span>Próximo desbloqueo: <strong className="text-emerald-400">{nextReward.icon} {nextReward.name}</strong> a los {nextReward.coinsRequired} coins</span>
                : <strong className="text-emerald-400">¡Han superado todas las metas globales configuradas!</strong>}
            </p>
          </div>
          <div className="text-right whitespace-nowrap bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl shadow-inner">
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">{currentCoins}</span>
            <span className="text-zinc-500 font-bold ml-2 text-sm uppercase tracking-wider">coins</span>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto overflow-y-hidden pb-4 pt-10 mt-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <div className="flex items-center min-w-max pb-20">
            {timelineRewards.map((r, i) => {
              const isReached = currentCoins >= r.coinsRequired
              const isNext = nextReward?.id === r.id
              const isAlreadyClaimed = logs.some(l => l.reason === `🎁 Canjeado: ${r.name}`)
              const canClaim = isReached && r.id !== 'start' && !isAlreadyClaimed
              const nextR = timelineRewards[i + 1]
              let segmentFill = 0
              if (nextR) {
                if (currentCoins >= nextR.coinsRequired) segmentFill = 100
                else if (currentCoins > r.coinsRequired)
                  segmentFill = ((currentCoins - r.coinsRequired) / (nextR.coinsRequired - r.coinsRequired)) * 100
              }
              return (
                <div key={r.id} className="relative flex items-center">
                  <div className="relative flex flex-col items-center z-10 w-28 sm:w-36">
                    <div
                      onClick={() => canClaim && setClaimModal({ reward: r })}
                      className={cn('w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-4 shadow-xl transition-all relative z-10',
                        canClaim ? 'bg-amber-400 border-amber-200 text-amber-900 shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-110 cursor-pointer hover:scale-125' :
                        isAlreadyClaimed ? 'bg-zinc-800 border-zinc-600 text-zinc-400 opacity-80' :
                        isNext ? 'bg-zinc-900 border-emerald-400 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] ring-4 ring-emerald-500/20 animate-pulse scale-110' :
                        'bg-zinc-900 border-zinc-800 text-zinc-600'
                      )}>
                      {isAlreadyClaimed ? <Check size={22} className="text-zinc-500" /> : <span className={cn('text-xl sm:text-3xl drop-shadow-sm', !isReached && !isNext && 'opacity-50 grayscale')}>{r.icon}</span>}
                    </div>
                    <div className="absolute top-16 sm:top-20 flex flex-col items-center w-full text-center px-1">
                      <span className={cn('text-[10px] sm:text-xs font-bold leading-tight mb-1',
                        canClaim ? 'text-amber-400' : isAlreadyClaimed ? 'text-zinc-600 line-through' : isNext ? 'text-emerald-400' : 'text-zinc-500'
                      )}>{r.name}</span>
                      {canClaim
                        ? <span className="text-[10px] text-amber-900 font-bold bg-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce mt-0.5 cursor-pointer" onClick={() => setClaimModal({ reward: r })}>Canjear</span>
                        : <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800/80 tracking-widest">{r.coinsRequired} coins</span>}
                    </div>
                  </div>
                  {i < timelineRewards.length - 1 && (
                    <div className="w-16 sm:w-24 h-3 sm:h-4 bg-zinc-950 rounded-full shadow-inner border border-zinc-900 relative -mx-4 z-0 overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 transition-all duration-1000 ease-out" style={{ width: `${segmentFill > 0 ? Math.max(5, segmentFill) : 0}%` }}>
                        {segmentFill > 0 && <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/40 animate-pulse" />}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Students + History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-base p-6">
          <h3 className="panel-title flex items-center gap-2 mb-1"><Users size={18} className="text-indigo-400" /> Ranking de Estudiantes</h3>
          <p className="panel-subtitle mb-4">Coins individuales · Haz clic en un premio dorado para canjearlo.</p>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {[...(students || [])].sort((a, b) => b.coins - a.coins).map((s, i) => {
              const nextInd = individualRewards.find(r => r.coinsRequired > s.coins)
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900/40 border border-transparent hover:border-zinc-800/50 transition-all group">
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    i === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    i === 1 ? 'bg-zinc-300/20 text-zinc-300 border border-zinc-300/30' :
                    i === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' : 'text-zinc-600 border border-zinc-800'
                  )}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{s.name}</p>
                    {nextInd && <p className="text-[10px] text-zinc-500 truncate">Próximo: {nextInd.icon} {nextInd.name} ({nextInd.coinsRequired} coins)</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {individualRewards.slice(0, 6).map(r => {
                      const reached = s.coins >= r.coinsRequired
                      const isNextR  = nextInd?.id === r.id
                      return (
                        <button key={r.id} title={`${r.name} (${r.coinsRequired} coins)`}
                          onClick={() => reached && setClaimModal({ reward: r, student: s })}
                          className={cn('w-7 h-7 rounded-full flex items-center justify-center text-sm border transition-all',
                            reached ? 'bg-amber-400 border-amber-200 text-amber-900 shadow-[0_0_10px_rgba(251,191,36,0.4)] hover:scale-125 cursor-pointer' :
                            isNextR  ? 'bg-zinc-900 border-emerald-500/50 text-zinc-500 animate-pulse' :
                            'bg-zinc-900 border-zinc-800 text-zinc-600 opacity-40 cursor-default grayscale'
                          )}>{r.icon}</button>
                      )
                    })}
                    <div className="ml-2 text-lg font-black text-white whitespace-nowrap">{s.coins}<span className="text-xs font-medium text-zinc-500 ml-0.5">coins</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card-base p-6 flex flex-col">
          <h3 className="panel-title flex items-center gap-2"><TrendingUp size={18} className="text-rose-400" /> Historial Reciente</h3>
          <p className="panel-subtitle">Últimas acciones del curso.</p>
          <div className="flex-1 space-y-2 mt-3 overflow-y-auto max-h-[360px] pr-1">
            {logs.length === 0 && <div className="text-zinc-500 text-sm text-center py-8">No se han registrado acciones.</div>}
            {logs.slice(0, 15).map(l => {
              const stName = l.student?.name?.split(' ')[0]
              return (
                <div key={l.id} className="flex items-start gap-3 p-2 group">
                  <div className="mt-1.5 flex-shrink-0">
                    <div className={cn('w-2 h-2 rounded-full ring-4 ring-zinc-950 group-hover:ring-zinc-900 transition-colors', l.coins > 0 ? 'bg-emerald-500' : l.coins === 0 ? 'bg-blue-500' : 'bg-rose-500')} />
                  </div>
                  <p className="text-xs text-zinc-300 break-words flex-1">
                    {stName ? <span className="font-semibold text-white">{stName}</span> : <span className="font-semibold text-blue-300">Clase</span>}
                    {' '}<span className={cn('font-medium', l.coins > 0 ? 'text-emerald-400' : l.coins === 0 ? 'text-blue-400' : 'text-rose-400')}>{l.coins > 0 ? '+' : ''}{l.coins} coins</span>
                    <span className="text-zinc-500"> por </span>{l.reason}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Award Modal */}
      <Modal open={awardModal} onClose={() => setAwardModal(false)} title="Otorgar Coins" lg>
        <div className="space-y-4">
          <div>
            <label className="label">Destinatario</label>
            <select className="select" value={awardTarget} onChange={e => setAwardTarget(e.target.value)}>
              <option value="class">Toda la clase</option>
              <optgroup label="Estudiantes Individuales">
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="label mb-2">Acción</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-[300px] overflow-y-auto pr-2">
              {activeActions.filter(a => awardTarget === 'class' ? a.affectsClass : a.affectsStudent).map(a => {
                const col = ACTION_COLORS[a.category] || { bg: '#1e3a8a', text: '#bfdbfe' }
                return (
                  <button key={a.id} onClick={() => awardCoins(a.coins, a.name, a.id)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all text-left group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md font-bold text-lg" style={{ background: `${col.bg}40`, color: col.text, border: `1px solid ${col.bg}` }}>
                      {a.coins > 0 ? '+' : ''}{a.coins}
                    </div>
                    <div className="flex-1"><p className="text-sm font-medium text-zinc-200 group-hover:text-white">{a.name}</p></div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* Claim Reward Modal */}
      <Modal open={!!claimModal} onClose={() => setClaimModal(null)} title={claimModal?.student ? 'Premio Individual' : 'Premio Grupal'}>
        <div className="text-center py-6 space-y-6">
          <div className="w-24 h-24 rounded-full bg-amber-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] border-4 border-amber-200 animate-pulse">
            <span className="text-5xl">{claimModal?.reward.icon}</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{claimModal?.reward.name}</h3>
            {claimModal?.student && <p className="text-indigo-300 font-semibold mt-1">Para: {claimModal.student.name}</p>}
            <p className="text-zinc-400 mt-1">{claimModal?.student ? `${claimModal.student.coins} coins personales` : `Nivel de ${claimModal?.reward.coinsRequired} coins alcanzado`}</p>
          </div>
          {claimModal?.reward.description && <p className="text-zinc-400 text-sm italic">{claimModal.reward.description}</p>}
          <div className="bg-emerald-900/20 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl text-sm font-medium">
            {claimModal?.student
              ? `Se registrará que ${claimModal.student.name.split(' ')[0]} canjeó este premio. Sus puntos individuales NO se descontarán.`
              : 'Se registrará que la clase entera canjeó este premio. Los puntos de clase NO se descontarán.'}
          </div>
          <div className="flex gap-3 justify-center pt-4">
            <button className="btn btn-secondary px-6" onClick={() => setClaimModal(null)}>Cancelar</button>
            <button className="btn bg-amber-500 hover:bg-amber-400 text-amber-950 px-8" onClick={claimReward}>¡Confirmar Canje!</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
