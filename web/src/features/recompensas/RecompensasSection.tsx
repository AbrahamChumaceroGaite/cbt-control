'use client'
import { useRef, useState } from 'react'
import { Plus, SlidersHorizontal, X, ChevronDown, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RewardResponse } from '@control-aula/shared'
import { Modal, Button, Input, Label, Select, Tooltip } from '@/components/ui'
import { rewardsService } from '@/services/rewards.service'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { CardActions }   from '@/components/shared/CardActions'
import { Pagination }    from '@/components/shared/Pagination'

const ICONS = ['★', '♪', '♫', '▶', '◉', '⇄', '◆', '+', '❄', '⚡', '♛', '⊕']

const REWARD_TYPES = [
  { value: 'class',      label: 'Grupal (Clase)'      },
  { value: 'individual', label: 'Individual (Alumno)' },
] as const
type RewardType = 'class' | 'individual'

interface Props {
  rewards:   RewardResponse[]
  reload:    () => void
  showToast: (msg: string, ok?: boolean) => void
}

const EMPTY_FORM = { name: '', description: '', icon: '★', coinsRequired: 100, type: 'class' as RewardType, isGlobal: true, isActive: true }

export function RecompensasSection({ rewards, reload, showToast }: Props) {
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState<RewardResponse | null>(null)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(0)
  const [pageSize, setPageSize] = useState(5)

  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter,  setTypeFilter]  = useState<'all' | 'class' | 'individual'>('all')
  const [statusFilter,setStatusFilter]= useState<'all' | 'active' | 'inactive'>('all')
  const filterRef = useRef<HTMLDivElement>(null)

  function changeType(t: RewardType) {
    setForm(p => ({ ...p, type: t, isGlobal: t === 'class' }))
  }

  const openNew  = () => { setForm(EMPTY_FORM); setEditing(null); setModal(true) }
  const openEdit = (r: RewardResponse) => {
    setForm({
      name: r.name, description: r.description, icon: r.icon,
      coinsRequired: r.coinsRequired,
      type: (r.type === 'individual' ? 'individual' : 'class') as RewardType,
      isGlobal: r.isGlobal, isActive: r.isActive,
    })
    setEditing(r); setModal(true)
  }

  async function save() {
    if (!form.name) return
    try {
      const { message } = editing
        ? await rewardsService.update(editing.id, form)
        : await rewardsService.create(form)
      showToast(message); setModal(false); reload()
    } catch (err: any) { showToast(err.message ?? 'Error al guardar', false) }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar recompensa permanentemente?')) return
    try {
      const { message } = await rewardsService.delete(id)
      showToast(message); reload()
    } catch (err: any) { showToast(err.message ?? 'Error al eliminar', false) }
  }

  const filtersActive = typeFilter !== 'all' || statusFilter !== 'all'

  const filtered = rewards.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (statusFilter === 'active'   && !r.isActive) return false
    if (statusFilter === 'inactive' &&  r.isActive) return false
    return true
  })

  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const FilterButton = (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setShowFilters(v => !v)}
        className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
          filtersActive
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filtros
        {filtersActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />}
        <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
      </button>

      {showFilters && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[200] w-56 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Filtros</span>
            {filtersActive && (
              <button onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setPage(0) }} className="text-[10px] text-zinc-500 hover:text-amber-400 flex items-center gap-1">
                <X className="w-3 h-3" />Limpiar
              </button>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wide">Tipo</label>
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value as any); setPage(0) }}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500">
              <option value="all">Todos</option>
              <option value="class">Grupal (Clase)</option>
              <option value="individual">Individual</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wide">Estado</label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(0) }}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500">
              <option value="all">Todos</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
          <p className="text-[10px] text-zinc-600 text-right">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="animate-in fade-in duration-300">
      <SectionHeader
        icon={Gift}
        iconClass="text-amber-400"
        title="Tienda de Recompensas"
        subtitle="Gestiona los premios canjeables por clase o por alumno."
        search={search}
        onSearch={v => { setSearch(v); setPage(0) }}
        filters={FilterButton}
        actions={
          <Tooltip content="Nueva recompensa">
            <Button size="sm" onClick={openNew}><Plus className="w-4 h-4" /></Button>
          </Tooltip>
        }
      />

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
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-zinc-500">Sin recompensas.</div>}
      </div>

      <div className="mt-4">
        <Pagination page={page} totalItems={filtered.length} pageSize={pageSize}
          onPageSizeChange={s => { setPageSize(s); setPage(0) }} onChange={setPage} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Recompensa' : 'Nueva Recompensa'}>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label>Nombre / Título</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Descripción</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Costo en Coins</Label><Input type="number" value={form.coinsRequired} onChange={e => setForm(p => ({ ...p, coinsRequired: parseInt(e.target.value) || 0 }))} /></div>
            <div className="space-y-1.5"><Label>Icono</Label>
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
              {form.type === 'class' ? 'Canjeable con coins grupales desde el panel de Aula' : 'Canjeable con coins personales desde el portal del alumno'}
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
