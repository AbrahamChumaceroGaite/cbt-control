'use client'
import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import type { CourseResponse } from '@control-aula/shared'
import { Modal, Button, Input, Label, Tooltip } from '@/components/ui'
import { coursesService } from '@/services/courses.service'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { CardActions }   from '@/components/shared/CardActions'
import { Pagination }    from '@/components/shared/Pagination'

interface CursosSectionProps {
  courses: CourseResponse[]
  reload: () => void
  showToast: (msg: string, ok?: boolean) => void
}

export function CursosSection({ courses, reload, showToast }: CursosSectionProps) {
  const [modal, setModal]   = useState(false)
  const [editing, setEditing] = useState<CourseResponse | null>(null)
  const [form, setForm]     = useState({ name: '', level: 'Secondary 2', parallel: 'A' })
  const [page, setPage]     = useState(0)
  const [pageSize, setPageSize] = useState(12)

  const openNew  = () => { setForm({ name: '', level: 'Secondary 2', parallel: 'A' }); setEditing(null); setModal(true) }
  const openEdit = (c: CourseResponse) => { setForm({ name: c.name, level: c.level, parallel: c.parallel }); setEditing(c); setModal(true) }

  async function save() {
    if (editing) {
      await coursesService.update(editing.id, form)
      showToast('Curso actualizado')
    } else {
      await coursesService.create(form)
      showToast('Curso creado')
    }
    setModal(false)
    reload()
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar este curso y todos sus estudiantes?')) return
    await coursesService.delete(id)
    showToast('Curso eliminado')
    reload()
  }

  const paginated = courses.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader title="Cursos" subtitle="Administra los cursos y niveles."
        actions={
          <Tooltip content="Nuevo curso">
            <Button size="sm" onClick={openNew}><Plus className="w-4 h-4" /></Button>
          </Tooltip>
        } />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map(c => (
          <div key={c.id} className="group relative card-base p-5 flex flex-col justify-between hover:border-zinc-600 transition-all duration-200">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{c.name}</h3>
                <span className="text-lg font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{c.classCoins} coins</span>
              </div>
              <div className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wider">{c.level} — Par. {c.parallel}</div>
              <div className="mt-4 text-sm text-zinc-400 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {c.studentCount ?? 0} estudiantes</div>
            </div>
            <CardActions onEdit={() => openEdit(c)} onDelete={() => del(c.id)} />
          </div>
        ))}
        {courses.length === 0 && <div className="col-span-full text-center py-12 text-zinc-500">No hay cursos creados.</div>}
      </div>

      <div className="mt-4">
        <Pagination page={page} totalItems={courses.length} pageSize={pageSize}
          onPageSizeChange={s => { setPageSize(s); setPage(0) }} onChange={setPage} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar curso' : 'Nuevo curso'}>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Nombre (ej. S2A)</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Nivel</Label><Input value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} /></div>
          <div className="space-y-1.5"><Label>Paralelo</Label><Input value={form.parallel} onChange={e => setForm(p => ({ ...p, parallel: e.target.value }))} /></div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => setModal(false)} className="flex-1">Cancelar</Button>
          <Button onClick={save} className="flex-1">{editing ? 'Guardar' : 'Crear Curso'}</Button>
        </div>
      </Modal>
    </div>
  )
}
