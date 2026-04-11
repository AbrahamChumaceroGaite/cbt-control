'use client'
import { X, Search, Users, User, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { Modal, Button, Input } from '@/components/ui'
import { COLORS, AWARD_MODE_STYLES } from '@/config/scheme'
import type { ActionResponse, StudentResponse } from '@control-aula/shared'
import type { AwardStep, TargetMode } from '../domain/types'

interface Props {
  open: boolean; step: AwardStep; targetMode: TargetMode
  selectedIds: Set<string>; studentQuery: string; chosenAction: ActionResponse | null
  awarding: boolean; applicable: ActionResponse[]; filteredStu: StudentResponse[]
  selectedStu: StudentResponse[]; totalStudents: number; canProceed: boolean
  onClose: () => void; setStep: (s: AwardStep) => void; setTargetMode: (m: TargetMode) => void
  toggleStudent: (id: string) => void; setStudentQuery: (q: string) => void
  setChosenAction: (a: ActionResponse) => void; onExecute: () => void
}

const STEPS: AwardStep[] = ['recipients', 'action', 'confirm']
const STEP_LABELS = ['Recipients', 'Action', 'Confirm']

function actionColor(category: string) {
  return (COLORS.action as Record<string, { bg: string; text: string }>)[category] ?? { bg: '#1e3a8a', text: '#bfdbfe' }
}

export function AwardModal({ open, step, targetMode, selectedIds, studentQuery, chosenAction, awarding, applicable, filteredStu, selectedStu, totalStudents, canProceed, onClose, setStep, setTargetMode, toggleStudent, setStudentQuery, setChosenAction, onExecute }: Props) {
  const stepIdx = STEPS.indexOf(step)

  return (
    <Modal open={open} onClose={onClose} title="Award Coins" size="lg">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-5">
        {STEPS.map((s, i) => {
          const done = i < stepIdx; const active = i === stepIdx
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className={`h-px w-8 ${done ? 'bg-amber-500' : 'bg-zinc-800'}`} />}
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${active ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : done ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'border-zinc-800 text-zinc-600'}`}>
                {done ? <CheckCircle2 className="w-3 h-3" /> : <span>{i + 1}</span>}
                {STEP_LABELS[i]}
              </div>
            </div>
          )
        })}
      </div>

      {/* Step 1 — Recipients */}
      {step === 'recipients' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['class', 'students'] as TargetMode[]).map(m => {
              const active = targetMode === m
              return (
                <button key={m} onClick={() => setTargetMode(m)} className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${active ? AWARD_MODE_STYLES[m] : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}>
                  {m === 'class' ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <div className="text-left">
                    <div className="font-semibold">{m === 'class' ? 'Whole class' : 'Select students'}</div>
                    <div className="text-[10px] opacity-70">{m === 'class' ? `${totalStudents} students` : 'One or more'}</div>
                  </div>
                </button>
              )
            })}
          </div>
          {targetMode === 'students' && (
            <div className="space-y-2">
              {selectedStu.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  {selectedStu.map(s => (
                    <span key={s.id} className="flex items-center gap-1 text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      {s.name.split(' ')[0]}
                      <button onClick={() => toggleStudent(s.id)} className="hover:text-white ml-0.5"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
                <Input className="pl-8 h-8 text-xs" placeholder="Search student..." value={studentQuery} onChange={e => setStudentQuery(e.target.value)} />
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                {filteredStu.map(s => {
                  const checked = selectedIds.has(s.id)
                  return (
                    <button key={s.id} onClick={() => toggleStudent(s.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left text-sm transition-all ${checked ? 'bg-amber-500/10 border-amber-500/30 text-zinc-100' : 'border-transparent hover:bg-zinc-900/60 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-amber-500 border-amber-500' : 'border-zinc-700'}`}>
                        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                      </div>
                      <span className="flex-1 font-medium truncate">{s.name}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">{s.coins}c</span>
                    </button>
                  )
                })}
                {filteredStu.length === 0 && <p className="text-center py-4 text-xs text-zinc-600">No matches</p>}
              </div>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button onClick={() => setStep('action')} disabled={!canProceed}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {/* Step 2 — Action */}
      {step === 'action' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
            {applicable.map(a => {
              const col = actionColor(a.category)
              return (
                <button key={a.id} onClick={() => { setChosenAction(a); setStep('confirm') }} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all text-left group">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base flex-shrink-0" style={{ background: `${col.bg}40`, color: col.text, border: `1px solid ${col.bg}` }}>
                    {a.coins > 0 ? '+' : ''}{a.coins}
                  </div>
                  <p className="text-sm font-medium text-zinc-200 group-hover:text-white leading-tight">{a.name}</p>
                </button>
              )
            })}
            {applicable.length === 0 && <p className="col-span-2 text-center py-8 text-sm text-zinc-600">No applicable actions</p>}
          </div>
          <Button variant="outline" size="sm" onClick={() => setStep('recipients')}><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 'confirm' && chosenAction && (() => {
        const col   = actionColor(chosenAction.category)
        const count = targetMode === 'class' ? totalStudents : selectedIds.size
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0" style={{ background: `${col.bg}40`, color: col.text, border: `1px solid ${col.bg}` }}>
                {chosenAction.coins > 0 ? '+' : ''}{chosenAction.coins}
              </div>
              <div>
                <p className="font-semibold text-zinc-100">{chosenAction.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{chosenAction.coins > 0 ? `+${chosenAction.coins}` : chosenAction.coins} coins per action</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Recipients</p>
              {targetMode === 'class'
                ? <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20"><Users className="w-4 h-4 text-blue-400" /><span className="text-sm text-blue-300 font-medium">Whole class — {totalStudents} students</span></div>
                : <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 max-h-28 overflow-y-auto">{selectedStu.map(s => <span key={s.id} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">{s.name.split(' ').slice(0, 2).join(' ')}</span>)}</div>
              }
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-700">
              <span className="text-sm text-zinc-400">Total to award</span>
              <span className={`text-lg font-black ${chosenAction.coins >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {chosenAction.coins >= 0 ? '+' : ''}{chosenAction.coins * count} coins
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setStep('action')} className="flex-1"><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button>
              <Button onClick={onExecute} disabled={awarding} className="flex-1">{awarding ? 'Awarding…' : 'Confirm!'}</Button>
            </div>
          </div>
        )
      })()}
    </Modal>
  )
}
