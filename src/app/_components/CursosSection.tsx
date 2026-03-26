'use client'
import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import type { Course } from '@/lib/types'
import { Modal } from './Modal'
import { SectionHeader } from './SectionHeader'
import { CardActions } from './CardActions'

interface CursosSectionProps {
  courses: Course[]
  reload: () => void
  showToast: (msg: string, ok?: boolean) => void
}

export function CursosSection({ courses, reload, showToast }: CursosSectionProps) {
  const [modal, setModal]   = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm]     = useState({ name: '', level: 'Secondary 2', parallel: 'A' })

  const openNew  = () => { setForm({ name: '', level: 'Secondary 2', parallel: 'A' }); setEditing(null); setModal(true) }
  const openEdit = (c: Course) => { setForm({ name: c.name, level: c.level, parallel: c.parallel }); setEditing(c); setModal(true) }

  async function save() {
    const url    = editing ? `/api/cursos/${editing.id}` : '/api/cursos'
    const method = editing ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { showToast(editing ? 'Curso actualizado' : 'Curso creado'); setModal(false); reload() }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar este curso y todos sus estudiantes?')) return
    await fetch(`/api/cursos/${id}`, { method: 'DELETE' })
    showToast('Curso eliminado'); reload()
  }

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader title="Cursos" subtitle="Administra los cursos y niveles."
        actions={<button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} /></button>} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <div key={c.id} className="group relative card-base p-5 flex flex-col justify-between hover:border-zinc-600 transition-all duration-200">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{c.name}</h3>
                <span className="text-lg font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">{c.classCoins} coins</span>
              </div>
              <div className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wider">{c.level} — Par. {c.parallel}</div>
              <div className="mt-4 text-sm text-zinc-400 flex items-center gap-1"><Users size={14} /> {c._count?.students ?? 0} estudiantes</div>
            </div>
            <CardActions onEdit={() => openEdit(c)} onDelete={() => del(c.id)} />
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar curso' : 'Nuevo curso'}>
        <div className="space-y-3">
          <div><label className="label">Nombre (ej. S2A)</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Nivel</label><input className="input" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} /></div>
          <div><label className="label">Paralelo</label><input className="input" value={form.parallel} onChange={e => setForm(p => ({ ...p, parallel: e.target.value }))} /></div>
        </div>
        <div className="modal-footer mt-6">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Guardar' : 'Crear Curso'}</button>
        </div>
      </Modal>
    </div>
  )
}
