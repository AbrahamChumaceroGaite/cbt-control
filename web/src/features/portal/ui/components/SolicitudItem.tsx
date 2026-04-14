import { X }                    from 'lucide-react'
import { StatusBadge, Button } from '@/components/ui'
import { formatDate }          from '@/lib/utils'
import { REQUEST_STATUS }      from '@/config/status'
import type { RedemptionReq }  from '../../domain/types'

interface Props {
  req:        RedemptionReq
  cancelling: string | null
  onCancel:   (id: string) => void
}

export function SolicitudItem({ req, cancelling, onCancel }: Props) {
  return (
    <div className="flex items-center gap-4 bg-zinc-900/70 rounded-2xl p-4 border border-zinc-800/40 hover:bg-zinc-900 transition-colors">
      <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
        {req.reward?.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-zinc-200 truncate leading-tight">{req.reward?.name}</p>
        <p className="text-[11px] text-zinc-600 mt-0.5">{formatDate(req.createdAt)}</p>
        {req.notes && <p className="text-[11px] text-zinc-500 mt-1 italic line-clamp-1">&ldquo;{req.notes}&rdquo;</p>}
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <StatusBadge status={req.status} variant="request" size="sm" />
        {req.status === REQUEST_STATUS.PENDING && (
          <Button
            variant="ghost" size="sm"
            onClick={() => onCancel(req.id)}
            loading={cancelling === req.id}
            className="h-auto px-2 py-0.5 text-[10px] font-semibold text-zinc-600 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40"
          >
            <X className="w-3 h-3" /> Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
