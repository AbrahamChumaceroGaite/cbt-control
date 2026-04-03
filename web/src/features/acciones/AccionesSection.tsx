'use client'
import { useRef, useState } from 'react'
import { Plus, SlidersHorizontal, X, ChevronDown, Zap } from 'lucide-react'
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

interface Props {
  actions:   ActionResponse[]
  reload:    () => void
  showToast: (msg: string, ok?: boolean) => void
}

type StatusFilter = 'all' | 'active' | 'inactive'
type ScopeFilter  = 'all' | 'class' | 'student'

export function AccionesSection({ actions, reload, showToast }: Props) {
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState<ActionResponse | null>(null)
  const [form,     setForm]     = useState({ name: '', coins: 2, category: 'blue', affectsClass: false, affectsStudent: true, isActive: true })
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(0)
  const [pageSize, setPageSize] = useState(12)

  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [category, setCategory] = useState('all')
  const [status,   setStatus]   = useState<StatusFilter>('all')
  const [scope,    setScope]    = useState<ScopeFilter>('all')
  const filterRef = useRef<HTMLDivElement>(null)

  const openNew  = () => { setForm({ name: '', coins: 2, category: 'blue', affectsClass: false, affectsStudent: true, isActive: true }); setEditing(null); setModal(true) }
  const openEdit = (a: ActionResponse) => { setForm({ ...a }); setEditing(a); setModal(true) }

  async function save() {
    if (!form.name) return
    try {
      const { message } = editing
        ? await actionsService.update(editing.id, form)
        : await actionsService.create(form)
      showToast(message)
      setModal(false)
      reload()
    } catch (err: any) { showToast(err.message ?? 'Error al guardar', false) }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar acción permanentemente?')) return
    try {
      const { message } = await actionsService.delete(id)
      showToast(message)
      reload()
    } catch (err: any) { showToast(err.message ?? 'Error al eliminar', false) }
  }

  const filtersActive = category !== 'all' || status !== 'all' || scope !== 'all'

  const filtered = actions.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== 'all' && a.category !== category) return false
    if (status === 'active'   && !a.isActive) return false
    if (status === 'inactive' &&  a.isActive) return false
    if (scope === 'class'   && !a.affectsClass)   return false
    if (scope === 'student' && !a.affectsStudent) return false
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
        <div className="absolute left-0 top-[calc(100%+6px)] z-[200] w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Filtros</span>
            {filtersActive && (
              <button onClick={() => { setCategory('all'); setStatus('all'); setScope('all'); setPage(0) }} className="text-[10px] text-zinc-500 hover:text-amber-400 flex items-center gap-1">
                <X className="w-3 h-3" />Limpiar
              </button>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wide">Categoría</label>
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(0) }}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500">
              <option value="all">Todas</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wide">Estado</label>
            <select value={status} onChange={e => { setStatus(e.target.value as StatusFilter); setPage(0) }}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500">
              <option value="all">Todos</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wide">Alcance</label>
            <select value={scope} onChange={e => { setScope(e.target.value as ScopeFilter); setPage(0) }}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500">
              <option value="all">Todos</option>
              <option value="class">Solo Clase</option>
              <option value="student">Solo Estudiante</option>
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
        icon={Zap}
        iconClass="text-amber-400"
        title="Catálogo de Acciones"
        subtitle="Configura los comportamientos y sus puntajes."
        search={search}
        onSearch={v => { setSearch(v); setPage(0) }}
        filters={FilterButton}
        actions={
          <Tooltip content="Nueva acción">
            <Button size="sm" onClick={openNew}><Plus className="w-4 h-4" /></Button>
          </Tooltip>
        }
      />

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
        {filtered.length === 0 && <div className="col-span-full text-center py-12 text-zinc-500">Sin acciones.</div>}
      </div>

      <div className="mt-4">
        <Pagination page={page} totalItems={filtered.length} pageSize={pageSize}
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
