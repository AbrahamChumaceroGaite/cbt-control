'use client'
import { useState, useRef } from 'react'
import { Plus, Upload, Pencil, Trash2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import type { Student } from '@/lib/types'
import { Modal, Button, Input, Label, Tooltip } from '@/components/ui'
import { SectionHeader } from './SectionHeader'
import { Pagination } from './Pagination'

interface EstudiantesSectionProps {
  students: Student[]
  currentCourse: string
  reload: () => void
  reloadAll: () => void
  showToast: (msg: string, ok?: boolean) => void
}

export function EstudiantesSection({ students, currentCourse, reload, reloadAll, showToast }: EstudiantesSectionProps) {
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm]       = useState({ name: '', code: '', email: '', coins: 0 })
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const fileInputRef          = useRef<HTMLInputElement>(null)

  const openNew  = () => { setForm({ name: '', code: '', email: '', coins: 0 }); setEditing(null); setModal(true) }
  const openEdit = (s: Student) => { setForm({ name: s.name, code: s.code, email: s.email || '', coins: s.coins }); setEditing(s); setModal(true) }

  async function save() {
    if (!form.name) return
    const url    = editing ? `/api/estudiantes/${editing.id}` : '/api/estudiantes'
    const method = editing ? 'PUT' : 'POST'
    const body   = editing ? form : { ...form, courseId: currentCourse }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { showToast(editing ? 'Actualizado' : 'Creado'); setModal(false); reload(); reloadAll() }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar estudiante?')) return
    await fetch(`/api/estudiantes/${id}`, { method: 'DELETE' })
    showToast('Eliminado'); reload(); reloadAll()
  }

  async function handleExcelUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      showToast('Analizando Excel...', true)
      const data     = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData  = XLSX.utils.sheet_to_json(worksheet)
      const parsed    = (jsonData as any[]).map(row => ({
        code:  row['CÓDIGO']?.toString() || row['No']?.toString() || '',
        name:  row['NOMBRE'] || row['Nombre'] || '',
        email: row['CORREO'] || row['Correo'] || '',
      })).filter(s => s.name)
      if (parsed.length === 0) throw new Error('No se encontraron columnas de NOMBRE válidas')
      const res = await fetch('/api/estudiantes/import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: currentCourse, students: parsed }),
      })
      if (res.ok) {
        const body = await res.json()
        showToast(`${body.count} estudiantes importados exitosamente.`)
        reload(); reloadAll()
      } else throw new Error(await res.text())
    } catch (err: any) {
      showToast(`Error: ${err.message}`, false)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const filtered  = (students || []).filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader
        title="Directorio de Alumnos"
        subtitle={`${students.length} estudiantes en el curso seleccionado.`}
        search={search} onSearch={v => { setSearch(v); setPage(0) }}
        actions={
          <>
            <Tooltip content="Importar desde Excel (.xlsx)">
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Importar Excel
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
