import { Modal, Button, Input } from '@/components/ui'
import { FormField }             from '@/components/shared/FormField'
import type { CourseFormState, CourseViewModel } from '../domain/types'

interface Props {
  open:    boolean
  editing: CourseViewModel | null
  form:    CourseFormState
  setForm: (fn: (p: CourseFormState) => CourseFormState) => void
  onSave:  () => void
  onClose: () => void
}

export function CursoFormModal({ open, editing, form, setForm, onSave, onClose }: Props) {
  const upd = (key: keyof CourseFormState, val: string | number) =>
    setForm(p => ({ ...p, [key]: val }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar curso' : 'Nuevo curso'}>
      <div className="space-y-3">
        <FormField label="Nombre (ej. S2A)">
          <Input value={form.name} onChange={e => upd('name', e.target.value)} />
        </FormField>
        <FormField label="Nivel">
          <Input value={form.level} onChange={e => upd('level', e.target.value)} />
        </FormField>
        <FormField label="Paralelo">
          <Input value={form.parallel} onChange={e => upd('parallel', e.target.value)} />
        </FormField>
        {editing && (
          <FormField label="Coins de Clase (ajuste manual)">
            <Input type="number" value={form.classCoins}
              onChange={e => upd('classCoins', parseInt(e.target.value) || 0)} />
          </FormField>
        )}
      </div>
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
        <Button onClick={onSave} className="flex-1">{editing ? 'Guardar' : 'Crear Curso'}</Button>
      </div>
    </Modal>
  )
}
