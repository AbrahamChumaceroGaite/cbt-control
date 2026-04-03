'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACTION_COLORS } from '@/lib/constants'
import type { ActionResponse } from '@control-aula/shared'
import { Modal, Button, Input, Label, Select, Tooltip } from '@/components/ui'
import { actionsService } from '@/services/actions.service'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { CardActions }   from '@/components/shared/CardActions'
import { Pagination }    from '@/components/shared/Pagination'

const CATEGORIES = [
  { value: 'green',  label: 'Verde — positivo'    },
  { value: 'blue',   label: 'Azul — colaboración' },
  { value: 'purple', label: 'Morado — maestría'   },
  { value: 'amber',  label: 'Ámbar — entregas'    },
  { value: 'mag',    label: 'Magenta — especial'  },
  { value: 'red',    label: 'Rojo — negativo'     },
]

interface AccionesSectionProps {
  actions: ActionResponse[]
  reload: () => void
  showToast: (msg: string, ok?: boolean) => void
}

export function AccionesSection({ actions, reload, showToast }: AccionesSectionProps) {
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState<ActionResponse | null>(null)
  const [form, setForm]       = useState({ name: '', coins: 2, category: 'blue', affectsClass: false, affectsStudent: true, isActive: true })
  const [page, setPage]       = useState(0)
  const [pageSize, setPageSize] = useState(12)

  const openNew  = () => { setForm({ name: '', coins: 2, category: 'blue', affectsClass: false, affectsStudent: true, isActive: true }); setEditing(null); setModal(true) }
  const openEdit = (a: ActionResponse) => { setForm({ ...a }); setEditing(a); setModal(true) }

  async function save() {
    if (!form.name) return
    try {
      if (editing) {
        await actionsService.update(editing.id, form)
        showToast('Acción actualizada')
      } else {
        await actionsService.create(form)
        showToast('Acción creada')
      }
      setModal(false)
      reload()
    } catch (err: any) {
      showToast(err.message ?? 'Error al guardar', false)
    }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar acción permanentemente?')) return
    try {
      await actionsService.delete(id)
      showToast('Eliminada')
      reload()
    } catch (err: any) {
      showToast(err.message ?? 'Error al eliminar', false)
    }
  }

  const paginated = actions.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader title="Catálogo de Acciones" subtitle="Configura los comportamientos y sus puntajes."
        actions={
          <Tooltip content="Nueva acción">
            <Button size="sm" onClick={openNew}><Plus className="w-4 h-4" /></Button>
          </Tooltip>
        } />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map(a => {
          const col = ACTION_COLORS[a.category] || { bg: '#1e3a8a', text: '#bfdbfe' }
          return (
            <div key={a.id} className={cn('group relative card-base p-5 flex flex-col justify-between transition-opacity hover:border-zinc-600', !a.isActive && 'opacity-60')}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg" style={{ background: `${col.bg}40`, color: col.text, border: `1px solid ${col.bg}` }}>
                    {a.coins > 0 ? '+' : ''}{a.coins}
                  </div>
                  {!a.isActive && <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Inactiva</span>}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 leading-tight">{a.name}</h3>
                <div className="flex gap-2 text-xs mt-3">
                  {a.affectsClass   && <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">Clase</span>}
                  {a.affectsStudent && <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">Estudiante</span>}
                </div>
              </div>
              <CardActions onEdit={() => openEdit(a)} onDelete={() => del(a.id)} />
            </div>
          )
        })}
        {actions.length === 0 && <div className="col-span-full text-center py-12 text-zinc-500">No hay acciones configuradas.</div>}
      </div>

      <div className="mt-4">
        <Pagination page={page} totalItems={actions.length} pageSize={pageSize}
          onPageSizeChange={s => { setPageSize(s); setPage(0) }} onChange={setPage} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Acción' : 'Nueva Acción'}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre descriptivo</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Coins</Label>
              <Input type="number" value={form.coins} onChange={e => setForm(p => ({ ...p, coins: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Categoría/Color</Label>
              <Select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.affectsClass} onChange={e => setForm(p => ({ ...p, affectsClass: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900" />
              <span className="text-sm text-zinc-300">Aplica a toda la clase</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.affectsStudent} onChange={e => setForm(p => ({ ...p, affectsStudent: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900" />
              <span className="text-sm text-zinc-300">Aplica a estudiante individual</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900" />
              <span className="text-sm text-zinc-300">Acción Activa (Visible en app)</span>
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={save} className="flex-1">{editing ? 'Guardar' : 'Crear Acción'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
