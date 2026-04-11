'use client'
import { Gift } from 'lucide-react'
import { Modal, Button, EmptyState } from '@/components/ui'
import { FilterPills } from '@/components/shared/FilterPills'
import { useSolicitudes }  from '../application/useSolicitudes'
import { SolicitudCard }   from './SolicitudCard'
import { REQUEST_STATUS }  from '@/config/status'

interface Props {
  /** Propagates the pending count to page.tsx badge — removed when page.tsx is migrated */
  onCountChange?: (n: number) => void
}

export function SolicitudesSection({ onCountChange }: Props) {
  const s = useSolicitudes({ onCountChange })
  const h = s.handlers

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Solicitudes de Recompensas</h2>
        <FilterPills
          options={[
            { value: 'pending', label: 'Pendientes' },
            { value: 'all',     label: 'Todas' },
          ]}
          value={s.filter}
          onChange={h.setFilter}
        />
      </div>

      {s.visible.length === 0 ? (
        <EmptyState
          icon={<Gift className="w-5 h-5" />}
          title={s.filter === REQUEST_STATUS.PENDING ? 'No hay solicitudes pendientes' : 'No hay solicitudes'}
        />
      ) : (
        <div className="space-y-3">
          {s.visible.map(item => (
            <SolicitudCard key={item.id} solicitud={item} processing={s.processing}
              onApprove={() => h.requestApprove(item)} onReject={() => h.reject(item.id)} />
          ))}
        </div>
      )}

      <Modal open={!!s.confirmItem} onClose={h.cancelApprove} title="Premio Individual">
        <div className="text-center py-6 space-y-6">
          <div className="w-24 h-24 rounded-full bg-amber-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] border-4 border-amber-200 animate-pulse">
            <span className="text-5xl">{s.confirmItem?.reward.icon}</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{s.confirmItem?.reward.name}</h3>
            <p className="text-indigo-300 font-semibold mt-1">Para: {s.confirmItem?.student.name}</p>
            <p className="text-zinc-400 mt-1">{s.confirmItem?.student.coins} coins personales</p>
          </div>
          <div className="bg-emerald-900/20 text-emerald-400 border border-emerald-500/20 p-4 rounded-xl text-sm font-medium">
            Se registrará que {s.confirmItem?.student.name.split(' ')[0]} canjeó este premio. Sus puntos individuales NO se descontarán.
          </div>
          <div className="flex gap-3 justify-center pt-4">
            <Button variant="outline" className="px-6" onClick={h.cancelApprove}>Cancelar</Button>
            <Button variant="amber" className="px-8" onClick={h.confirmApprove} disabled={!!s.processing}>
              {s.processing ? 'Procesando…' : '¡Confirmar Canje!'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
