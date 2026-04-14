import { Modal, Button, Input, Combobox, Checkbox } from '@/components/ui'
import { FormField }                    from '@/components/shared/FormField'
import { REWARD_TYPES, REWARD_ICONS }   from '../domain/types'
import type { RewardFormState, RewardViewModel, RewardType } from '../domain/types'

interface Props {
  open:         boolean
  editing:      RewardViewModel | null
  form:         RewardFormState
  formErrors:   { name?: string; coinsRequired?: string }
  setForm:      (fn: (p: RewardFormState) => RewardFormState) => void
  changeType:   (t: RewardType) => void
  onSave:       () => void
  onClose:      () => void
}

export function RewardFormModal({ open, editing, form, formErrors, setForm, changeType, onSave, onClose }: Props) {
  const upd = (key: keyof RewardFormState, val: unknown) => setForm(p => ({ ...p, [key]: val }))

  const finalPrice = form.discount > 0
    ? Math.max(1, Math.round(form.coinsRequired * (1 - form.discount / 100)))
    : null

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Reward' : 'New Reward'}>
      <div className="space-y-4">
        <FormField label="Name / Title" error={formErrors.name}>
          <Input value={form.name} onChange={e => upd('name', e.target.value)} />
        </FormField>
        <FormField label="Description">
          <Input value={form.description} onChange={e => upd('description', e.target.value)} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Cost in Coins" error={formErrors.coinsRequired}>
            <Input type="number" value={form.coinsRequired} onChange={e => upd('coinsRequired', parseInt(e.target.value) || 0)} />
          </FormField>
          <FormField label="Icon">
            <Combobox
              value={form.icon}
              onChange={v => upd('icon', v)}
              options={REWARD_ICONS.map(i => ({ value: i, label: i }))}
            />
          </FormField>
        </div>
        <FormField label="Discount (%) — 0 = no discount">
          <div className="flex items-center gap-3">
            <Input type="number" min={0} max={100} value={form.discount} className="w-24"
              onChange={e => upd('discount', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} />
            {finalPrice !== null && (
              <span className="text-xs text-rose-400 font-bold">Final price: {finalPrice} coins</span>
            )}
          </div>
        </FormField>
        <FormField label="Reward Type">
          <Combobox
            value={form.type}
            onChange={v => changeType(v as RewardType)}
            options={REWARD_TYPES.map(t => ({ value: t.value, label: t.label }))}
          />
          <p className="text-xs text-zinc-500 pl-1 mt-1">
            {form.type === 'class'
              ? 'Redeemable with class coins from the Classroom panel'
              : 'Redeemable with personal coins from the student portal'}
          </p>
        </FormField>
        <div className="pt-2 border-t border-zinc-800">
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <Checkbox checked={form.isActive} onCheckedChange={v => upd('isActive', v)} />
            <span className="text-sm text-zinc-300">Active (Available for redemption)</span>
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={onSave} className="flex-1">{editing ? 'Save changes' : 'Create Reward'}</Button>
        </div>
      </div>
    </Modal>
  )
}
