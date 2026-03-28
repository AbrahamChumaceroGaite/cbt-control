'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ACTION_COLORS } from '@/lib/types'
import type { Course, Student, Action, Reward, Log } from '@/lib/types'
import { Modal, Button, Label, Select } from '@/components/ui'
import { RewardsTimeline } from './RewardsTimeline'
import { StudentRanking }  from './StudentRanking'
import { RecentHistory }   from './RecentHistory'

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

  const activeActions     = (actions  || []).filter(a => a.isActive)
  const classRewards      = (rewards  || []).filter(r => r.type === 'class' && r.isActive).sort((a, b) => a.coinsRequired - b.coinsRequired)
  const individualRewards = (rewards  || []).filter(r => r.type === 'individual' && r.isActive).sort((a, b) => a.coinsRequired - b.coinsRequired)
  const timelineRewards   = [
    { id: 'start', name: 'Inicio de Curso', coinsRequired: 0, icon: '🚀', isGlobal: true, isActive: true } as Reward,
    ...classRewards,
  ]
  const currentCoins = course?.classCoins ?? 0
  const nextReward   = classRewards.find(r => r.coinsRequired > currentCoins)

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
        <Button onClick={() => setAwardModal(true)} className="px-5 py-2.5 rounded-full shadow-lg shadow-blue-900/20">
          <Plus className="w-4 h-4 mr-2" /> Otorgar Coins
        </Button>
      </div>

      <RewardsTimeline
        timelineRewards={timelineRewards}
        currentCoins={currentCoins}
        nextReward={nextReward}
        logs={logs}
        onClaim={r => setClaimModal({ reward: r })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StudentRanking
          students={students}
          individualRewards={individualRewards}
          onClaim={(r, s) => setClaimModal({ reward: r, student: s })}
        />
        <RecentHistory logs={logs} />
      </div>

      {/* Award Modal */}
      <Modal open={awardModal} onClose={() => setAwardModal(false)} title="Otorgar Coins" lg>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Destinatario</Label>
            <Select value={awardTarget} onChange={e => setAwardTarget(e.target.value)}>
              <option value="class">Toda la clase</option>
              <optgroup label="Estudiantes Individuales">
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </optgroup>
            </Select>
          </div>
          <div>
            <Label className="mb-2">Acción</Label>
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
            <Button variant="outline" className="px-6" onClick={() => setClaimModal(null)}>Cancelar</Button>
            <Button variant="amber" className="px-8" onClick={claimReward}>¡Confirmar Canje!</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
