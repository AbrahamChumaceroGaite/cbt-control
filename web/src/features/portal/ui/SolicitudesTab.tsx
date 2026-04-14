'use client'
import { useState }             from 'react'
import { PortalTabHeader }      from './PortalTabHeader'
import { SolicitudListSection } from './components/SolicitudListSection'
import { ConfirmDialog }        from '@/components/shared/ConfirmDialog'
import { useSolicitudesTab }    from '../application/useSolicitudesTab'
import { REQUEST_STATUS }       from '@/config/status'
import type { StudentData, RedemptionReq } from '../domain/types'

interface Props {
  student:  StudentData
  requests: RedemptionReq[]
  onLogout: () => void
  onReload: () => void
}

export function SolicitudesTab({ student, requests, onLogout, onReload }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const { cancelling, doCancel }  = useSolicitudesTab(onReload)

  const pendingCount = requests.filter(r => r.status === REQUEST_STATUS.PENDING).length

  return (
    <div className="min-h-screen pb-28">
      <PortalTabHeader student={student} onLogout={onLogout} />

      <main className="max-w-2xl mx-auto px-4 pt-5">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">My Requests</h2>
          <div className="flex-1 h-px bg-zinc-800" />
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[10px] font-bold text-amber-400">
              {pendingCount} pending
            </span>
          )}
        </div>

        <SolicitudListSection
          requests={requests} cancelling={cancelling}
          onCancel={id => setConfirmId(id)}
        />
      </main>

      <ConfirmDialog
        open={!!confirmId}
        onConfirm={() => { const id = confirmId!; setConfirmId(null); doCancel(id) }}
        onCancel={() => setConfirmId(null)}
        title="Cancel Request"
        message="Are you sure you want to cancel this pending request? This action cannot be undone."
        confirmText="Yes, cancel"
        variant="red"
        loading={!!cancelling}
      />
    </div>
  )
}
