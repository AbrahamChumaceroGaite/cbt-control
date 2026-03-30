'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { solicitudesService, type SolicitudFull } from '@/services/solicitudes.service'

interface SolicitudesSectionProps {
  showToast: (msg: string, ok?: boolean) => void
  onCountChange: (n: number) => void
}

export function SolicitudesSection({ showToast, onCountChange }: SolicitudesSectionProps) {
  const [items, setItems]       = useState<SolicitudFull[]>([])
  const [filter, setFilter]     = useState<'pending' | 'all'>('pending')
  const [processing, setProcessing] = useState<string | null>(null)

  async function load() {
    const data = await solicitudesService.getAll().catch(() => [] as SolicitudFull[])
    setItems(data)
    onCountChange(data.filter(s => s.status === 'pending').length)
  }

  useEffect(() => { load() }, [])

  const visible = filter === 'pending' ? items.filter(i => i.status === 'pending') : items

  async function handle(id: string, status: 'approved' | 'rejected') {
    setProcessing(id)
    try {
      await solicitudesService.process(id, status)
      showToast(status === 'approved' ? 'Solicitud aprobada ✓' : 'Solicitud rechazada', status === 'approved')
      load()
    } finally { setProcessing(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Solicitudes de Recompensas</h2>
        <div className="flex gap-2">
          <Button size="sm" variant={filter === 'pending' ? 'default' : 'secondary'} onClick={() => setFilter('pending')}>Pendientes</Button>
          <Button size="sm" variant={filter === 'all'     ? 'default' : 'secondary'} onClick={() => setFilter('all')}>Todas</Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">No hay solicitudes {filter === 'pending' ? 'pendientes' : ''}</div>
      ) : (
        <div className="space-y-3">
          {visible.map(s => (
            <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
              <div className="text-3xl">{s.reward.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-zinc-200">{s.student.name}</span>
                  <span className="text-xs text-zinc-500">·</span>
                  <span className="text-xs text-zinc-500">{s.student.course.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-1 ${
                    s.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                    s.status === 'rejected' ? 'bg-red-900/50 text-red-400' :
                    'bg-amber-900/50 text-amber-400'
                  }`}>
                    {s.status === 'approved' ? 'Aprobado' : s.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                  </span>
                </div>
                <div className="text-sm text-zinc-400 mt-0.5">
                  {s.reward.name} <span className="text-zinc-600">·</span> <span className="text-amber-500">{s.reward.coinsRequired} coins</span>
                </div>
                <div className="text-xs text-zinc-600 mt-0.5">
                  {new Date(s.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  {' '}<span className="text-zinc-700">·</span> Estudiante tiene {s.student.coins} coins
                </div>
              </div>
              {s.status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => handle(s.id, 'approved')} disabled={processing === s.id}>
                    {processing === s.id ? '...' : 'Aprobar'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handle(s.id, 'rejected')} disabled={processing === s.id}>
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
