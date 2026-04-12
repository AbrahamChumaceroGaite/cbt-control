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
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Course' : 'New Course'}>
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Name (e.g. S2A)">
            <Input value={form.name} onChange={e => upd('name', e.target.value)} placeholder="S2A" />
          </FormField>
          <FormField label="Level">
            <Input value={form.level} onChange={e => upd('level', e.target.value)} placeholder="2nd" />
          </FormField>
        </div>
        <FormField label="Group (Parallel)">
          <Input value={form.parallel} onChange={e => upd('parallel', e.target.value)} placeholder="A" />
        </FormField>
        {editing && (
          <FormField label="Class Coins (manual adjustment)">
            <Input type="number" value={form.classCoins}
              onChange={e => upd('classCoins', parseInt(e.target.value) || 0)} />
          </FormField>
        )}
      </div>
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button onClick={onSave} className="flex-1">{editing ? 'Save changes' : 'Create Course'}</Button>
      </div>
    </Modal>
  )
}
