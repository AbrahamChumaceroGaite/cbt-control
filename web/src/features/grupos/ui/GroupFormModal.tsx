import { Modal, Button, Input, Checkbox } from '@/components/ui'
import { FormField }             from '@/components/shared/FormField'
import type { GroupFormState, GroupViewModel } from '../domain/types'
import type { StudentResponse } from '@control-aula/shared'

interface Props {
  open:         boolean
  editing:      GroupViewModel | null
  form:         GroupFormState
  students:     StudentResponse[]
  setForm:      (fn: (p: GroupFormState) => GroupFormState) => void
  toggleMember: (id: string) => void
  onSave:       () => void
  onClose:      () => void
}

export function GroupFormModal({ open, editing, form, students, setForm, toggleMember, onSave, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar Grupo' : 'Nuevo Grupo'}>
      <div className="space-y-4">
        <FormField label="Nombre del Grupo">
          <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </FormField>
        <FormField label="Seleccionar Miembros">
          <div className="max-h-[250px] overflow-y-auto space-y-1 border border-zinc-700 rounded-lg p-2 bg-zinc-800/30">
            {students.map(s => (
              <label key={s.id} className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800/50 cursor-pointer">
                <Checkbox checked={form.studentIds.includes(s.id)} onCheckedChange={() => toggleMember(s.id)} />
                <span className="text-sm text-zinc-300">{s.name}</span>
              </label>
            ))}
            {students.length === 0 && (
              <p className="text-sm text-zinc-500 p-2">No hay estudiantes en el curso.</p>
            )}
          </div>
        </FormField>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={onSave} className="flex-1">{editing ? 'Guardar' : 'Crear Grupo'}</Button>
        </div>
      </div>
    </Modal>
  )
}
