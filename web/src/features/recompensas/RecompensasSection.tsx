'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RewardResponse } from '@control-aula/shared'
import { Modal, Button, Input, Label, Select, Tooltip } from '@/components/ui'
import { rewardsService } from '@/services/rewards.service'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { CardActions }   from '@/components/shared/CardActions'
import { Pagination }    from '@/components/shared/Pagination'

const ICONS = ['★', '♪', '♫', '▶', '◉', '⇄', '◆', '+', '❄', '⚡', '♛', '⊕']

// Only valid types that the schema and the UI recognise
const REWARD_TYPES = [
  { value: 'class',      label: 'Grupal (Clase)'       },
  { value: 'individual', label: 'Individual (Alumno)'  },
] as const
type RewardType = 'class' | 'individual'

interface RecompensasSectionProps {
  rewards: RewardResponse[]
  reload: () => void
  showToast: (msg: string, ok?: boolean) => void
}

const EMPTY_FORM = { name: '', description: '', icon: '★', coinsRequired: 100, type: 'class' as RewardType, isGlobal: true, isActive: true }

export function RecompensasSection({ rewards, reload, showToast }: RecompensasSectionProps) {
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState<RewardResponse | null>(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [page, setPage]       = useState(0)
  const [pageSize, setPageSize] = useState(12)

  function changeType(t: RewardType) {
    // isGlobal is determined by type: class = global, individual = personal
    setForm(p => ({ ...p, type: t, isGlobal: t === 'class' }))
  }

  const openNew  = () => { setForm(EMPTY_FORM); setEditing(null); setModal(true) }
  const openEdit = (r: RewardResponse) => {
    setForm({
      name:          r.name,
      description:   r.description,
      icon:          r.icon,
      coinsRequired: r.coinsRequired,
      type:          (r.type === 'individual' ? 'individual' : 'class') as RewardType,
      isGlobal:      r.isGlobal,
      isActive:      r.isActive,
    })
    setEditing(r)
    setModal(true)
  }

  async function save() {
    if (!form.name) return
    try {
      if (editing) {
        await rewardsService.update(editing.id, form)
        showToast('Recompensa actualizada')
      } else {
        await rewardsService.create(form)
        showToast('Recompensa creada')
      }
      setModal(false)
      reload()
    } catch {
      showToast('Error al guardar la recompensa', false)
    }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar recompensa permanentemente?')) return
    await rewardsService.delete(id)
    showToast('Eliminada')
    reload()
  }

  const paginated = rewards.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader title="Tienda de Recompensas" subtitle="Gestiona los premios canjeables por clase o por alumno."
        actions={
          <Tooltip content="Nueva recompensa">
            <Button size="sm" onClick={openNew}><Plus className="w-4 h-4" /></Button>
          </Tooltip>
        } />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map(r => (
          <div key={r.id} className={cn('group relative card-base p-5 flex flex-col justify-between transition-opacity hover:border-zinc-600', !r.isActive && 'opacity-60')}>
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xl">{r.icon}</div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-zinc-800 text-zinc-300">{r.coinsRequired} coins</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{r.name}</h3>
              <p className="text-sm text-zinc-400 line-clamp-2">{r.description || 'Sin descripción'}</p>
              <div className="flex gap-2 text-xs mt-4">
                {r.type === 'class'
                  ? <span className="px-2 py-0.5 rounded bg-blue-900/30 text-blue-300">Grupal (Clase)</span>
                  : <span className="px-2 py-0.5 rounded bg-rose-900/30 text-rose-300">Individual (Alumno)</span>}
                {!r.isActive && <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">Inactiva</span>}
              </div>
            </div>
            <CardActions onEdit={() => openEdit(r)} onDelete={() => del(r.id)} />
          </div>
        ))}
        {rewards.length === 0 && <div className="col-span-full text-center py-12 text-zinc-500">No hay recompensas creadas.</div>}
      </div>

      <div className="mt-4">
        <Pagination page={page} totalItems={rewards.length} pageSize={pageSize}
          onPageSizeChange={s => { setPageSize(s); setPage(0) }} onChange={setPage} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Recompensa' : 'Nueva Recompensa'}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre / Título</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Costo en Coins</Label>
              <Input type="number" value={form.coinsRequired} onChange={e => setForm(p => ({ ...p, coinsRequired: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Icono</Label>
              <Select value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}>
                {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Tipo de Premio</Label>
            <Select value={form.type} onChange={e => changeType(e.target.value as RewardType)}>
              {REWARD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <p className="text-xs text-zinc-500 pl-1">
              {form.type === 'class'
                ? 'Canjeable con coins grupales desde el panel de Aula'
                : 'Canjeable con coins personales desde el portal del alumno'}
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-800">
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900" />
              <span className="text-sm text-zinc-300">Activa (Disponible para canje)</span>
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={save} className="flex-1">{editing ? 'Guardar' : 'Crear Premio'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
