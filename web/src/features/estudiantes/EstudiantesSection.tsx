'use client'
import { useState, useRef } from 'react'
import { Plus, Upload, Pencil, Trash2, Users, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import * as XLSX from 'xlsx'
import type { StudentResponse } from '@control-aula/shared'
import { Modal, Button, Input, Label, Tooltip } from '@/components/ui'
import { studentsService } from '@/services/students.service'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Pagination }    from '@/components/shared/Pagination'

interface Props {
  students:      StudentResponse[]
  currentCourse: string
  reload:        () => void
  reloadAll:     () => void
  showToast:     (msg: string, ok?: boolean) => void
}

export function EstudiantesSection({ students, currentCourse, reload, reloadAll, showToast }: Props) {
  const [modal,    setModal]    = useState(false)
  const [editing,  setEditing]  = useState<StudentResponse | null>(null)
  const [form,     setForm]     = useState({ name: '', code: '', email: '', coins: 0 })
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Coin range filter
  const maxCoins    = students.length ? Math.max(...students.map(s => s.coins), 0) : 500
  const [showFilters,  setShowFilters]  = useState(false)
  const [coinMin,      setCoinMin]      = useState(0)
  const [coinMax,      setCoinMax]      = useState<number | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  const effectiveMax  = coinMax ?? maxCoins
  const filtersActive = coinMin > 0 || (coinMax !== null && coinMax < maxCoins)

  const openNew  = () => { setForm({ name: '', code: '', email: '', coins: 0 }); setEditing(null); setModal(true) }
  const openEdit = (s: StudentResponse) => { setForm({ name: s.name, code: s.code, email: s.email || '', coins: s.coins }); setEditing(s); setModal(true) }

  async function save() {
    if (!form.name) return
    try {
      const { message } = editing
        ? await studentsService.update(editing.id, form)
        : await studentsService.create({ ...form, courseId: currentCourse })
      showToast(message); setModal(false); reload(); reloadAll()
    } catch (err: any) { showToast(err.message ?? 'Error al guardar', false) }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar estudiante?')) return
    try {
      const { message } = await studentsService.delete(id)
      showToast(message); reload(); reloadAll()
    } catch (err: any) { showToast(err.message ?? 'Error al eliminar', false) }
  }

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      showToast('Analizando Excel...', true)
      const buffer    = await file.arrayBuffer()
      const workbook  = XLSX.read(buffer)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData  = XLSX.utils.sheet_to_json(worksheet)
      const parsed    = (jsonData as any[]).map(row => ({
        code:  row['CÓDIGO']?.toString() || row['No']?.toString() || '',
        name:  row['NOMBRE'] || row['Nombre'] || '',
        email: row['CORREO'] || row['Correo'] || '',
      })).filter(s => s.name)
      if (parsed.length === 0) throw new Error('No se encontraron columnas de NOMBRE válidas')
      const { data, message } = await studentsService.import(currentCourse, parsed)
      showToast(message || `${data.count} estudiantes importados`)
      reload(); reloadAll()
    } catch (err: any) { showToast(`Error: ${err.message}`, false) }
    finally { if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const filtered  = (students || []).filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.code.toLowerCase().includes(search.toLowerCase())) return false
    if (s.coins < coinMin) return false
    if (coinMax !== null && s.coins > coinMax) return false
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
        <div className="absolute left-0 top-[calc(100%+6px)] z-[200] w-72 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Filtrar por Coins</span>
            {filtersActive && (
              <button onClick={() => { setCoinMin(0); setCoinMax(null); setPage(0) }} className="text-[10px] text-zinc-500 hover:text-amber-400 flex items-center gap-1">
                <X className="w-3 h-3" />Limpiar
              </button>
            )}
          </div>

          {/* Range display */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 font-bold">{coinMin}</span>
            <span className="text-zinc-600">—</span>
            <span className="text-amber-400 font-bold">{effectiveMax}</span>
          </div>

          {/* Min slider */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wide">Mínimo: {coinMin}</label>
            <input
              type="range"
              min={0}
              max={maxCoins}
              step={1}
              value={coinMin}
              onChange={e => {
                const v = parseInt(e.target.value)
                setCoinMin(v)
                if (coinMax !== null && v > coinMax) setCoinMax(v)
                setPage(0)
              }}
              className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Max slider */}
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wide">Máximo: {effectiveMax}</label>
            <input
              type="range"
              min={0}
              max={maxCoins}
              step={1}
              value={effectiveMax}
              onChange={e => {
                const v = parseInt(e.target.value)
                setCoinMax(v >= maxCoins ? null : v)
                if (v < coinMin) setCoinMin(v)
                setPage(0)
              }}
              className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <p className="text-[10px] text-zinc-600 text-right">{filtered.length} alumno{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader
        icon={Users}
        iconClass="text-blue-400"
        title="Directorio de Alumnos"
        subtitle={`${students.length} estudiantes en el curso seleccionado.`}
        search={search}
        onSearch={v => { setSearch(v); setPage(0) }}
        filters={FilterButton}
        actions={
          <>
            <Tooltip content="Importar desde Excel (.xlsx)">
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Importar
              </Button>
            </Tooltip>
            <input type="file" ref={fileInputRef} accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} />
            <Tooltip content="Nuevo alumno">
              <Button size="sm" onClick={openNew}><Plus className="w-4 h-4" /></Button>
            </Tooltip>
          </>
        }
      />

      <div className="card-base border-t-0 rounded-none sm:rounded-xl sm:border-t">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-900/50 text-zinc-400 uppercase text-xs font-semibold tracking-wider border-b border-zinc-800 text-left">
              <tr>
                <th className="px-6 py-4">Estudiante</th>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Correo</th>
                <th className="px-6 py-4 text-right">Coins</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {paginated.map(s => (
                <tr key={s.id} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-6 py-4"><div className="font-semibold text-zinc-100">{s.name}</div></td>
                  <td className="px-6 py-4 text-zinc-400">{s.code || '-'}</td>
                  <td className="px-6 py-4 text-zinc-400">{s.email || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-zinc-800 text-zinc-200 font-bold border border-zinc-700">{s.coins}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Tooltip content="Editar alumno">
                        <button onClick={() => openEdit(s)} className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      </Tooltip>
                      <Tooltip content="Eliminar alumno">
                        <button onClick={() => del(s.id)} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No se encontraron estudiantes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <Pagination page={page} totalItems={filtered.length} pageSize={pageSize}
          onPageSizeChange={s => { setPageSize(s); setPage(0) }} onChange={setPage} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar alumno' : 'Nuevo alumno'}>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Nombre completo</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Código</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Correo</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          {editing && <div className="space-y-1.5"><Label>Coins</Label><Input type="number" value={form.coins} onChange={e => setForm(p => ({ ...p, coins: parseInt(e.target.value) || 0 }))} /></div>}
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => setModal(false)} className="flex-1">Cancelar</Button>
          <Button onClick={save} className="flex-1">{editing ? 'Guardar' : 'Crear'}</Button>
        </div>
      </Modal>
    </div>
  )
}
