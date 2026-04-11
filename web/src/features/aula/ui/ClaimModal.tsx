'use client'
import { Modal, Button } from '@/components/ui'
import type { ClaimState } from '../domain/types'

interface Props {
  state:     ClaimState | null
  onClose:   () => void
  onConfirm: () => void
}

export function ClaimModal({ state, onClose, onConfirm }: Props) {
  const { reward, student } = state ?? {}

  return (
    <Modal open={!!state} onClose={onClose} title={student ? 'Individual Reward' : 'Class Reward'}>
      <div className="text-center py-6 space-y-6">
        <div className="w-24 h-24 rounded-full bg-amber-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] border-4 border-amber-200 animate-pulse">
          <span className="text-5xl">{reward?.icon}</span>
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">{reward?.name}</h3>
          {student && <p className="text-indigo-300 font-semibold mt-1">For: {student.name}</p>}
          <p className="text-zinc-400 mt-1">
            {student ? `${student.coins} individual coins` : `Class level of ${reward?.coinsRequired} coins reached`}
          </p>
        </div>
        {reward?.description && (
          <p className="text-zinc-400 text-sm italic">{reward.description}</p>
        )}
        <div className="bg-emerald-900/20 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl text-sm font-medium">
          {student
            ? `${student.name.split(' ')[0]}'s redemption will be recorded. Individual coins will NOT be deducted.`
            : 'Class redemption will be recorded. Class coins will NOT be deducted.'}
        </div>
        <div className="flex gap-3 justify-center pt-4">
          <Button variant="outline" className="px-6" onClick={onClose}>Cancel</Button>
          <Button variant="amber" className="px-8" onClick={onConfirm}>Confirm Redemption!</Button>
        </div>
      </div>
    </Modal>
  )
}
