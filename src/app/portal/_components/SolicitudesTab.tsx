import type { RedemptionReq } from './types'

interface SolicitudesTabProps {
  requests: RedemptionReq[]
}

export function SolicitudesTab({ requests }: SolicitudesTabProps) {
  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {requests.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">Sin solicitudes aún</div>
      ) : (
        requests.map(req => (
          <div key={req.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800/60 rounded-2xl p-4">
            <div className="text-3xl shrink-0">{req.reward.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-zinc-200 text-sm">{req.reward.name}</div>
              <div className="text-xs text-zinc-600 mt-0.5">
                {new Date(req.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
              {req.notes && <div className="text-xs text-zinc-400 mt-1 italic">"{req.notes}"</div>}
            </div>
            <div className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold ${
              req.status === 'approved' ? 'bg-green-950 text-green-400 border border-green-800/40' :
              req.status === 'rejected' ? 'bg-red-950 text-red-400 border border-red-800/40' :
              'bg-amber-950 text-amber-400 border border-amber-800/40'
            }`}>
              {req.status === 'approved' ? '✓ Aprobado' : req.status === 'rejected' ? '✕ Rechazado' : '⏳ Pendiente'}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
