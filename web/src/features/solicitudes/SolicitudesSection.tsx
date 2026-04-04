'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button, Modal } from '@/components/ui'
import { solicitudesService, type SolicitudFull } from '@/services/solicitudes.service'

interface SolicitudesSectionProps {
  showToast: (msg: string, ok?: boolean) => void
  onCountChange: (n: number) => void
}

export function SolicitudesSection({ showToast, onCountChange }: SolicitudesSectionProps) {
  const [items, setItems]           = useState<SolicitudFull[]>([])
  const [filter, setFilter]         = useState<'pending' | 'all'>('pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const [confirmItem, setConfirmItem] = useState<SolicitudFull | null>(null)

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
      const { message } = await solicitudesService.process(id, status)
      showToast(message, status === 'approved')
      load()
    } catch (err: any) {
      showToast(err.message ?? 'Error al procesar solicitud', false)
    } finally { setProcessing(null) }
  }

  async function confirmApprove() {
    if (!confirmItem) return
    await handle(confirmItem.id, 'approved')
    setConfirmItem(null)
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
                  <Button size="sm" onClick={() => setConfirmItem(s)} disabled={processing === s.id}>
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

      {/* ── Confirm approve modal ─────────────────────────────────────── */}
      <Modal open={!!confirmItem} onClose={() => setConfirmItem(null)} title="Premio Individual">
        <div className="text-center py-6 space-y-6">
          <div className="w-24 h-24 rounded-full bg-amber-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] border-4 border-amber-200 animate-pulse">
            <span className="text-5xl">{confirmItem?.reward.icon}</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{confirmItem?.reward.name}</h3>
            <p className="text-indigo-300 font-semibold mt-1">Para: {confirmItem?.student.name}</p>
            <p className="text-zinc-400 mt-1">{confirmItem?.student.coins} coins personales</p>
          </div>
          <div className="bg-emerald-900/20 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl text-sm font-medium">
            Se registrará que {confirmItem?.student.name.split(' ')[0]} canjeó este premio. Sus puntos individuales NO se descontarán.
          </div>
          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" className="px-6" onClick={() => setConfirmItem(null)}>Cancelar</Button>
            <Button variant="amber" className="px-8" onClick={confirmApprove} disabled={!!processing}>
              {processing ? 'Procesando…' : '¡Confirmar Canje!'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
