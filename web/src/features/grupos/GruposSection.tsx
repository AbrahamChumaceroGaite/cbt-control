'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { GroupResponse, StudentResponse, CourseResponse } from '@control-aula/shared'
import { Modal, Button, Input, Label, Tooltip } from '@/components/ui'
import { groupsService }  from '@/services/groups.service'
import { SectionHeader }  from '@/components/shared/SectionHeader'
import { CourseSelect }   from '@/components/shared/CourseSelect'
import { CardActions }    from '@/components/shared/CardActions'
import { Pagination }     from '@/components/shared/Pagination'

interface GruposSectionProps {
  groups:         GroupResponse[]
  students:       StudentResponse[]
  courses:        CourseResponse[]
  currentCourse:  string
  onCourseChange: (id: string) => void
  reload:         () => void
  showToast:      (msg: string, ok?: boolean) => void
}

export function GruposSection({ groups, students, courses, currentCourse, onCourseChange, reload, showToast }: GruposSectionProps) {
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState<GroupResponse | null>(null)
  const [form, setForm]       = useState({ name: '', studentIds: [] as string[] })
  const [page, setPage]       = useState(0)
  const [pageSize, setPageSize] = useState(5)

  const openNew  = () => { setForm({ name: '', studentIds: [] }); setEditing(null); setModal(true) }
  const openEdit = (g: GroupResponse) => { setForm({ name: g.name, studentIds: g.members.map(m => m.studentId) }); setEditing(g); setModal(true) }

  async function save() {
    if (!form.name) return
    try {
      const { message } = editing
        ? await groupsService.update(editing.id, { ...form, courseId: currentCourse })
        : await groupsService.create({ ...form, courseId: currentCourse })
      showToast(message)
      setModal(false)
      reload()
    } catch (err: any) {
      showToast(err.message ?? 'Error al guardar', false)
    }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar grupo?')) return
    try {
      const { message } = await groupsService.delete(id)
      showToast(message)
      reload()
    } catch (err: any) {
      showToast(err.message ?? 'Error al eliminar', false)
    }
  }

  function toggleMember(studentId: string) {
    setForm(p => ({
      ...p,
      studentIds: p.studentIds.includes(studentId)
        ? p.studentIds.filter(id => id !== studentId)
        : [...p.studentIds, studentId],
    }))
  }

  const paginated = groups.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader title="Grupos de Trabajo" subtitle="Gestiona los equipos en el curso seleccionado."
        actions={
          <>
            <CourseSelect courses={courses} value={currentCourse} onChange={onCourseChange} />
            <Tooltip content="Nuevo grupo">
              <Button size="sm" onClick={openNew}><Plus className="w-4 h-4" /></Button>
            </Tooltip>
          </>
        } />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.map(g => (
          <div key={g.id} className="group relative card-base p-5 flex flex-col justify-between hover:border-zinc-600 transition-all duration-200">
            <div>
              <h3 className="text-lg font-bold text-white mb-3">{g.name}</h3>
              <div className="space-y-1 mt-2">
                {g.members.map(m => (
                  <div key={m.id} className="text-sm text-zinc-300 flex justify-between items-center bg-zinc-900/50 px-2 py-1 rounded">
                    <span>{m.student.name}</span>
                    <span className="text-xs font-mono text-zinc-500">{m.student.coins} coins</span>
                  </div>
                ))}
                {g.members.length === 0 && <div className="text-zinc-500 text-sm italic">Sin miembros</div>}
              </div>
            </div>
            <CardActions onEdit={() => openEdit(g)} onDelete={() => del(g.id)} />
          </div>
        ))}
        {groups.length === 0 && <div className="col-span-full text-center py-12 text-zinc-500">No hay grupos creados en este curso.</div>}
      </div>

      <div className="mt-4">
        <Pagination page={page} totalItems={groups.length} pageSize={pageSize}
          onPageSizeChange={s => { setPageSize(s); setPage(0) }} onChange={setPage} />
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Grupo' : 'Nuevo Grupo'}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre del Grupo</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Seleccionar Miembros</Label>
            <div className="max-h-[250px] overflow-y-auto space-y-1 border border-zinc-700 rounded-lg p-2 bg-zinc-800/30">
              {students.map(s => (
                <label key={s.id} className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800/50 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-zinc-700 bg-zinc-900"
                    checked={form.studentIds.includes(s.id)} onChange={() => toggleMember(s.id)} />
                  <span className="text-sm text-zinc-300">{s.name}</span>
                </label>
              ))}
              {students.length === 0 && <div className="text-sm text-zinc-500 p-2">No hay estudiantes en el curso.</div>}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setModal(false)} className="flex-1">Cancelar</Button>
            <Button onClick={save} className="flex-1">{editing ? 'Guardar' : 'Crear Grupo'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
