import { Modal, Button, Input } from '@/components/ui'
import { FormField }             from '@/components/shared/FormField'
import type { StudentFormState, StudentViewModel } from '../domain/types'

interface Props {
  open:    boolean
  editing: StudentViewModel | null
  form:    StudentFormState
  setForm: (fn: (p: StudentFormState) => StudentFormState) => void
  onSave:  () => void
  onClose: () => void
}

export function EstudianteFormModal({ open, editing, form, setForm, onSave, onClose }: Props) {
  const upd = (key: keyof StudentFormState, val: string | number) =>
    setForm(p => ({ ...p, [key]: val }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar alumno' : 'Nuevo alumno'}>
      <div className="space-y-3">
        <FormField label="Nombre completo">
          <Input value={form.name} onChange={e => upd('name', e.target.value)} />
        </FormField>
        <FormField label="Código">
          <Input value={form.code} onChange={e => upd('code', e.target.value)} />
        </FormField>
        <FormField label="Correo">
          <Input type="email" value={form.email} onChange={e => upd('email', e.target.value)} />
        </FormField>
        {editing && (
          <FormField label="Coins">
            <Input type="number" value={form.coins} onChange={e => upd('coins', parseInt(e.target.value) || 0)} />
          </FormField>
        )}
      </div>
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
        <Button onClick={onSave} className="flex-1">{editing ? 'Guardar' : 'Crear'}</Button>
      </div>
    </Modal>
  )
}
