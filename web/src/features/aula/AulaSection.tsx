'use client'
import { useState } from 'react'
import { Plus, Search, Users, User, X, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { ACTION_COLORS } from '@/lib/constants'
import type { CourseResponse, StudentResponse, ActionResponse, RewardResponse, CoinLogResponse } from '@control-aula/shared'
import { Modal, Button, Input } from '@/components/ui'
import { pointsService } from '@/services/points.service'
import { RewardsTimeline } from './RewardsTimeline'
import { StudentRanking }  from './StudentRanking'
import { RecentHistory }   from './RecentHistory'

interface Props {
  course:    CourseResponse | undefined
  students:  StudentResponse[]
  actions:   ActionResponse[]
  rewards:   RewardResponse[]
  logs:      CoinLogResponse[]
  reload:    () => void
  showToast: (msg: string, ok?: boolean) => void
}

type AwardStep = 'recipients' | 'action' | 'confirm'
type TargetMode = 'class' | 'students'

export function AulaSection({ course, students, actions, rewards, logs, reload, showToast }: Props) {
  const [awardModal,  setAwardModal]  = useState(false)
  const [claimModal,  setClaimModal]  = useState<{ reward: RewardResponse; student?: StudentResponse } | null>(null)

  // Award multi-step state
  const [step,        setStep]        = useState<AwardStep>('recipients')
  const [targetMode,  setTargetMode]  = useState<TargetMode>('class')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [studentQ,    setStudentQ]    = useState('')
  const [chosenAction,setChosenAction]= useState<ActionResponse | null>(null)
  const [awarding,    setAwarding]    = useState(false)

  const activeActions     = (actions  || []).filter(a => a.isActive)
  const classRewards      = (rewards  || []).filter(r => r.type === 'class' && r.isActive).sort((a, b) => a.coinsRequired - b.coinsRequired)
  const individualRewards = (rewards  || []).filter(r => r.type === 'individual' && r.isActive).sort((a, b) => a.coinsRequired - b.coinsRequired)
  const timelineRewards   = [
    { id: 'start', name: 'Inicio de Curso', coinsRequired: 0, icon: '🚀', isGlobal: true, isActive: true } as RewardResponse,
    ...classRewards,
  ]
  const currentCoins = course?.classCoins ?? 0
  const nextReward   = classRewards.find(r => r.coinsRequired > currentCoins)

  function openAward() {
    setStep('recipients'); setTargetMode('class')
    setSelectedIds(new Set()); setStudentQ('')
    setChosenAction(null)
    setAwardModal(true)
  }

  function resetAndClose() {
    setAwardModal(false)
    setTimeout(() => { setStep('recipients'); setTargetMode('class'); setSelectedIds(new Set()); setStudentQ(''); setChosenAction(null) }, 300)
  }

  function toggleStudent(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function canProceedFromRecipients() {
    return targetMode === 'class' || selectedIds.size > 0
  }

  const filteredStudents = students.filter(s =>
    !studentQ || s.name.toLowerCase().includes(studentQ.toLowerCase()) || s.code.toLowerCase().includes(studentQ.toLowerCase())
  )

  const applicableActions = activeActions.filter(a =>
    targetMode === 'class' ? a.affectsClass : a.affectsStudent
  )

  async function executeAward() {
    if (!chosenAction || !course) return
    setAwarding(true)
    try {
      if (targetMode === 'class') {
        await pointsService.award({ courseId: course.id, actionId: chosenAction.id, coins: chosenAction.coins, reason: chosenAction.name })
      } else {
        await Promise.all(
          Array.from(selectedIds).map(studentId =>
            pointsService.award({ courseId: course.id, studentId, actionId: chosenAction.id, coins: chosenAction.coins, reason: chosenAction.name })
          )
        )
      }
      showToast(`Coins otorgados: ${chosenAction.name}`, chosenAction.coins >= 0)
      resetAndClose()
      reload()
    } catch (err: any) {
      showToast(err.message ?? 'Error al otorgar coins', false)
    } finally { setAwarding(false) }
  }

  async function claimReward() {
    if (!claimModal) return
    try {
      const { reward, student: s } = claimModal
      const { message } = await pointsService.award({
        courseId: course!.id,
        ...(s ? { studentId: s.id } : {}),
        coins: 0, reason: `Canjeado: ${reward.name}`,
      })
      showToast(message)
      setClaimModal(null)
      reload()
    } catch (err: any) { showToast(err.message ?? 'Error al canjear premio', false) }
  }

  const selectedStudents = students.filter(s => selectedIds.has(s.id))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Clase Activa</h2>
          <p className="text-zinc-400 text-sm mt-1">Sigue el progreso de {course?.name || 'la clase'} en la línea de tiempo de recompensas.</p>
        </div>
        <Button onClick={openAward} className="px-5 py-2.5 rounded-full shadow-lg shadow-blue-900/20">
          <Plus className="w-4 h-4 mr-2" /> Otorgar Coins
        </Button>
      </div>

      <RewardsTimeline timelineRewards={timelineRewards} currentCoins={currentCoins} nextReward={nextReward} logs={logs} onClaim={r => setClaimModal({ reward: r })} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StudentRanking students={students} individualRewards={individualRewards} onClaim={(r, s) => setClaimModal({ reward: r, student: s })} />
        <RecentHistory logs={logs} />
      </div>

      {/* ── Award modal (multi-step) ───────────────────────────────── */}
      <Modal open={awardModal} onClose={resetAndClose} title="Otorgar Coins" lg>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {(['recipients', 'action', 'confirm'] as AwardStep[]).map((s, i) => {
            const labels = ['Destinatarios', 'Acción', 'Confirmar']
            const idx    = ['recipients', 'action', 'confirm'].indexOf(step)
            const done   = i < idx
            const active = i === idx
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className={`h-px flex-1 w-8 ${done ? 'bg-amber-500' : 'bg-zinc-800'}`} />}
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                  active ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' :
                  done   ? 'bg-zinc-800 border-zinc-700 text-zinc-300' :
                           'border-zinc-800 text-zinc-600'
                }`}>
                  {done ? <CheckCircle2 className="w-3 h-3" /> : <span>{i + 1}</span>}
                  {labels[i]}
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── Step 1: Recipients ─────────────────────────────────── */}
        {step === 'recipients' && (
          <div className="space-y-4">
            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTargetMode('class')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  targetMode === 'class'
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-300'
                    : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-semibold">Toda la clase</div>
                  <div className="text-[10px] opacity-70">{students.length} estudiantes</div>
                </div>
              </button>
              <button
                onClick={() => setTargetMode('students')}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  targetMode === 'students'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                }`}
              >
                <User className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-semibold">Seleccionar</div>
                  <div className="text-[10px] opacity-70">Uno o varios</div>
                </div>
              </button>
            </div>

            {/* Student multi-select */}
            {targetMode === 'students' && (
              <div className="space-y-2">
                {/* Selected chips */}
                {selectedStudents.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    {selectedStudents.map(s => (
                      <span key={s.id} className="flex items-center gap-1 text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        {s.name.split(' ')[0]}
                        <button onClick={() => toggleStudent(s.id)} className="hover:text-white ml-0.5">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
                  <Input
                    className="pl-8 h-8 text-xs"
                    placeholder="Buscar alumno..."
                    value={studentQ}
                    onChange={e => setStudentQ(e.target.value)}
                  />
                </div>

                {/* Student list */}
                <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                  {filteredStudents.map(s => {
                    const checked = selectedIds.has(s.id)
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleStudent(s.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left text-sm transition-all ${
                          checked
                            ? 'bg-amber-500/10 border-amber-500/30 text-zinc-100'
                            : 'border-transparent hover:bg-zinc-900/60 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                          checked ? 'bg-amber-500 border-amber-500' : 'border-zinc-700'
                        }`}>
                          {checked && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                        </div>
                        <span className="flex-1 font-medium truncate">{s.name}</span>
                        <span className="text-[10px] text-zinc-600 font-mono">{s.coins}c</span>
                      </button>
                    )
                  })}
                  {filteredStudents.length === 0 && (
                    <p className="text-center py-4 text-xs text-zinc-600">Sin coincidencias</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep('action')} disabled={!canProceedFromRecipients()}>
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ─── Step 2: Action ─────────────────────────────────────── */}
        {step === 'action' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
              {applicableActions.map(a => {
                const col = ACTION_COLORS[a.category] || { bg: '#1e3a8a', text: '#bfdbfe' }
                return (
                  <button key={a.id}
                    onClick={() => { setChosenAction(a); setStep('confirm') }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0"
                      style={{ background: `${col.bg}40`, color: col.text, border: `1px solid ${col.bg}` }}>
                      {a.coins > 0 ? '+' : ''}{a.coins}
                    </div>
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-white leading-tight">{a.name}</p>
                  </button>
                )
              })}
              {applicableActions.length === 0 && (
                <p className="col-span-2 text-center py-8 text-sm text-zinc-600">Sin acciones aplicables</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep('recipients')}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Volver
            </Button>
          </div>
        )}

        {/* ─── Step 3: Confirm ────────────────────────────────────── */}
        {step === 'confirm' && chosenAction && (
          <div className="space-y-4">
            {/* Action summary */}
            {(() => {
              const col = ACTION_COLORS[chosenAction.category] || { bg: '#1e3a8a', text: '#bfdbfe' }
              return (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0"
                    style={{ background: `${col.bg}40`, color: col.text, border: `1px solid ${col.bg}` }}>
                    {chosenAction.coins > 0 ? '+' : ''}{chosenAction.coins}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100">{chosenAction.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {chosenAction.coins > 0 ? `+${chosenAction.coins}` : chosenAction.coins} coins por acción
                    </p>
                  </div>
                </div>
              )
            })()}

            {/* Recipients summary */}
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Destinatarios</p>
              {targetMode === 'class' ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300 font-medium">Toda la clase — {students.length} estudiantes</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 max-h-28 overflow-y-auto">
                  {selectedStudents.map(s => (
                    <span key={s.id} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      {s.name.split(' ').slice(0, 2).join(' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-700">
              <span className="text-sm text-zinc-400">Total a otorgar</span>
              <span className={`text-lg font-black ${chosenAction.coins >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {chosenAction.coins >= 0 ? '+' : ''}{chosenAction.coins * (targetMode === 'class' ? students.length : selectedIds.size)} coins
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setStep('action')} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Volver
              </Button>
              <Button onClick={executeAward} disabled={awarding} className="flex-1">
                {awarding ? 'Otorgando…' : '¡Confirmar!'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Claim modal ───────────────────────────────────────────── */}
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
