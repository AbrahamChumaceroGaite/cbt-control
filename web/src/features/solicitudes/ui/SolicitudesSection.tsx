'use client'
import React, { useState } from 'react'
import { Gift, Landmark }      from 'lucide-react'
import { Modal, Button, EmptyState } from '@/components/ui'
import { FilterPills } from '@/components/shared/FilterPills'
import { TransaccionesSection } from '@/features/tienda/ui/TransaccionesSection'
import { useSolicitudes }  from '../application/useSolicitudes'
import { SolicitudCard }   from './SolicitudCard'
import { REQUEST_STATUS }  from '@/config/status'

interface Props {
  /** Propagates the pending count to page.tsx badge — removed when page.tsx is migrated */
  onCountChange?: (n: number) => void
}

type ApprovalTab = 'awards' | 'transfers'

const APPROVAL_TABS: { id: ApprovalTab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'awards',    label: 'Award Requests',  icon: Gift,     desc: 'Reward redemptions' },
  { id: 'transfers', label: 'Coin Transfers',  icon: Landmark, desc: 'Bank approvals'     },
]

export function SolicitudesSection({ onCountChange }: Props) {
  const [tab, setTab] = useState<ApprovalTab>('awards')
  const s = useSolicitudes({ onCountChange })
  const h = s.handlers

  return (
    <div className="space-y-5">
      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-zinc-900/60 border border-zinc-800 rounded-2xl w-fit">
        {APPROVAL_TABS.map(t => {
          const Icon   = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-zinc-700 text-zinc-100 shadow-lg shadow-black/30'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
              <div className="text-left hidden sm:block">
                <div className="leading-none">{t.label}</div>
                <div className={`text-[10px] mt-0.5 leading-none font-normal ${active ? 'text-zinc-400' : 'text-zinc-600'}`}>{t.desc}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Award Requests tab */}
      {tab === 'awards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Award Requests</h2>
            <FilterPills
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'all',     label: 'All'     },
              ]}
              value={s.filter}
              onChange={h.setFilter}
            />
          </div>

          {s.visible.length === 0 ? (
            <EmptyState
              icon={<Gift className="w-5 h-5" />}
              title={s.filter === REQUEST_STATUS.PENDING ? 'No pending requests' : 'No requests'}
            />
          ) : (
            <div className="space-y-3">
              {s.visible.map(item => (
                <SolicitudCard key={item.id} solicitud={item} processing={s.processing}
                  onApprove={() => h.requestApprove(item)} onReject={() => h.reject(item.id)} />
              ))}
            </div>
          )}

          <Modal open={!!s.confirmItem} onClose={h.cancelApprove} title="Individual Award">
            <div className="text-center py-6 space-y-6">
              <div className="w-24 h-24 rounded-full bg-amber-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] border-4 border-amber-200 animate-pulse">
                <span className="text-5xl">{s.confirmItem?.reward.icon}</span>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{s.confirmItem?.reward.name}</h3>
                <p className="text-indigo-300 font-semibold mt-1">For: {s.confirmItem?.student.name}</p>
                <p className="text-zinc-400 mt-1">{s.confirmItem?.student.coins} personal coins</p>
              </div>
              <div className="bg-emerald-900/20 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl text-sm font-medium">
                This will record that {s.confirmItem?.student.name.split(' ')[0]} redeemed this reward. Their personal coins will NOT be deducted.
              </div>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" className="px-6" onClick={h.cancelApprove}>Cancel</Button>
                <Button variant="amber" className="px-8" onClick={h.confirmApprove} disabled={!!s.processing}>
                  {s.processing ? 'Processing…' : 'Confirm Redemption!'}
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* Coin Transfers tab */}
      {tab === 'transfers' && <TransaccionesSection />}
    </div>
  )
}
