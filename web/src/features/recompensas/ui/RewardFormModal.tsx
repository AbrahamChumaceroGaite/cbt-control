import { Modal, Button, Input, Select, Checkbox } from '@/components/ui'
import { FormField }                    from '@/components/shared/FormField'
import { REWARD_TYPES, REWARD_ICONS }   from '../domain/types'
import type { RewardFormState, RewardViewModel, RewardType } from '../domain/types'

interface Props {
  open:       boolean
  editing:    RewardViewModel | null
  form:       RewardFormState
  setForm:    (fn: (p: RewardFormState) => RewardFormState) => void
  changeType: (t: RewardType) => void
  onSave:     () => void
  onClose:    () => void
}

export function RewardFormModal({ open, editing, form, setForm, changeType, onSave, onClose }: Props) {
  const upd = (key: keyof RewardFormState, val: unknown) => setForm(p => ({ ...p, [key]: val }))

  const finalPrice = form.discount > 0
    ? Math.max(1, Math.round(form.coinsRequired * (1 - form.discount / 100)))
    : null

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar Recompensa' : 'Nueva Recompensa'}>
      <div className="space-y-4">
        <FormField label="Nombre / Título">
          <Input value={form.name} onChange={e => upd('name', e.target.value)} />
        </FormField>
        <FormField label="Descripción">
          <Input value={form.description} onChange={e => upd('description', e.target.value)} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Costo en Coins">
            <Input type="number" value={form.coinsRequired} onChange={e => upd('coinsRequired', parseInt(e.target.value) || 0)} />
          </FormField>
          <FormField label="Icono">
            <Select value={form.icon} onChange={e => upd('icon', e.target.value)}>
              {REWARD_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Descuento (%) — 0 = sin descuento">
          <div className="flex items-center gap-3">
            <Input type="number" min={0} max={100} value={form.discount} className="w-24"
              onChange={e => upd('discount', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} />
            {finalPrice !== null && (
              <span className="text-xs text-rose-400 font-bold">Precio final: {finalPrice} coins</span>
            )}
          </div>
        </FormField>
        <FormField label="Tipo de Premio">
          <Select value={form.type} onChange={e => changeType(e.target.value as RewardType)}>
            {REWARD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <p className="text-xs text-zinc-500 pl-1">
            {form.type === 'class'
              ? 'Canjeable con coins grupales desde el panel de Aula'
              : 'Canjeable con coins personales desde el portal del alumno'}
          </p>
        </FormField>
        <div className="pt-2 border-t border-zinc-800">
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <Checkbox checked={form.isActive} onCheckedChange={v => upd('isActive', v)} />
            <span className="text-sm text-zinc-300">Activa (Disponible para canje)</span>
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={onSave} className="flex-1">{editing ? 'Guardar' : 'Crear Premio'}</Button>
        </div>
      </div>
    </Modal>
  )
}
