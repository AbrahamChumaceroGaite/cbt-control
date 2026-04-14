import { Button, StatusBadge }             from '@/components/ui'
import { REQUEST_STATUS }                  from '@/config/status'
import { formatDateTime }                  from '@/lib/utils'
import type { SolicitudViewModel }         from '../domain/types'

interface Props {
  solicitud:      SolicitudViewModel
  processing:     string | null
  onApprove:      () => void
  onReject:       () => void
}

export function SolicitudCard({ solicitud: s, processing, onApprove, onReject }: Props) {
  const busy = processing === s.id

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
      <div className="text-3xl">{s.reward.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-zinc-200">{s.student.name}</span>
          <span className="text-xs text-zinc-500">·</span>
          <span className="text-xs text-zinc-500">{s.student.course.name}</span>
          <StatusBadge status={s.status} variant="request" size="sm" className="ml-1" />
        </div>
        <div className="text-sm text-zinc-400 mt-0.5">
          {s.reward.name} <span className="text-zinc-600">·</span>{' '}
          <span className="text-amber-500">{s.reward.coinsRequired} coins</span>
        </div>
        <div className="text-xs text-zinc-600 mt-0.5">
          {formatDateTime(s.createdAt)}
          {' '}<span className="text-zinc-700">·</span> Student has {s.student.coins} coins
        </div>
      </div>
      {s.status === REQUEST_STATUS.PENDING && (
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={onApprove} disabled={busy}>{busy ? '...' : 'Approve'}</Button>
          <Button size="sm" variant="destructive" onClick={onReject} disabled={busy}>Reject</Button>
        </div>
      )}
    </div>
  )
}
