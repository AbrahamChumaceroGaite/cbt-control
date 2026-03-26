'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Group, Student } from '@/lib/types'
import { Modal } from './Modal'
import { SectionHeader } from './SectionHeader'
import { CardActions } from './CardActions'

interface GruposSectionProps {
  groups: Group[]
  students: Student[]
  currentCourse: string
  reload: () => void
  showToast: (msg: string, ok?: boolean) => void
}

export function GruposSection({ groups, students, currentCourse, reload, showToast }: GruposSectionProps) {
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState<Group | null>(null)
  const [form, setForm]       = useState({ name: '', memberIds: [] as string[] })

  const openNew  = () => { setForm({ name: '', memberIds: [] }); setEditing(null); setModal(true) }
  const openEdit = (g: Group) => { setForm({ name: g.name, memberIds: g.members.map(m => m.studentId) }); setEditing(g); setModal(true) }

  async function save() {
    if (!form.name) return
    const url    = editing ? `/api/grupos/${editing.id}` : '/api/grupos'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, courseId: currentCourse }) })
    if (res.ok) { showToast(editing ? 'Grupo actualizado' : 'Grupo creado'); setModal(false); reload() }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar grupo?')) return
    await fetch(`/api/grupos/${id}`, { method: 'DELETE' })
    showToast('Eliminado'); reload()
  }

  function toggleMember(studentId: string) {
    setForm(p => ({
      ...p,
      memberIds: p.memberIds.includes(studentId)
        ? p.memberIds.filter(id => id !== studentId)
        : [...p.memberIds, studentId],
    }))
  }

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader title="Grupos de Trabajo" subtitle="Gestiona los equipos en el curso seleccionado."
        actions={<button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} /></button>} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(g => (
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

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Grupo' : 'Nuevo Grupo'}>
        <div className="space-y-4">
          <div><label className="label">Nombre del Grupo</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div>
            <label className="label">Seleccionar Miembros</label>
            <div className="max-h-[250px] overflow-y-auto space-y-1 border border-zinc-800 rounded-md p-2 bg-zinc-900/20">
              {students.map(s => (
                <label key={s.id} className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800/50 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-zinc-950"
                    checked={form.memberIds.includes(s.id)} onChange={() => toggleMember(s.id)} />
                  <span className="text-sm text-zinc-300">{s.name}</span>
                </label>
              ))}
              {students.length === 0 && <div className="text-sm text-zinc-500 p-2">No hay estudiantes en el curso.</div>}
            </div>
          </div>
        </div>
        <div className="modal-footer mt-6">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Guardar' : 'Crear Grupo'}</button>
        </div>
      </Modal>
    </div>
  )
}
