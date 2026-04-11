import { Modal, Button, Input, Combobox, Checkbox } from '@/components/ui'
import { FormField }                    from '@/components/shared/FormField'
import { ACTION_CATEGORIES }            from '../domain/types'
import type { ActionFormState, ActionViewModel } from '../domain/types'

interface Props {
  open:    boolean
  editing: ActionViewModel | null
  form:    ActionFormState
  setForm: (fn: (p: ActionFormState) => ActionFormState) => void
  onSave:  () => void
  onClose: () => void
}

const CHECKBOX_FIELDS: { key: keyof ActionFormState; label: string }[] = [
  { key: 'affectsClass',   label: 'Aplica a toda la clase'          },
  { key: 'affectsStudent', label: 'Aplica a estudiante individual'  },
  { key: 'isActive',       label: 'Acción Activa (Visible en app)'  },
]

export function ActionFormModal({ open, editing, form, setForm, onSave, onClose }: Props) {
  const upd = (key: keyof ActionFormState, val: unknown) => setForm(p => ({ ...p, [key]: val }))

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar Acción' : 'Nueva Acción'}>
      <div className="space-y-4">
        <FormField label="Nombre descriptivo">
          <Input value={form.name} onChange={e => upd('name', e.target.value)} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Coins">
            <Input type="number" value={form.coins}
              onChange={e => upd('coins', parseInt(e.target.value) || 0)} />
          </FormField>
          <FormField label="Categoría/Color">
            <Combobox
              value={form.category}
              onChange={v => upd('category', v)}
              options={ACTION_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
            />
          </FormField>
        </div>
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          {CHECKBOX_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={form[key] as boolean} onCheckedChange={v => upd(key, v)} />
              <span className="text-sm text-zinc-300">{label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={onSave} className="flex-1">{editing ? 'Guardar' : 'Crear Acción'}</Button>
        </div>
      </div>
    </Modal>
  )
}
