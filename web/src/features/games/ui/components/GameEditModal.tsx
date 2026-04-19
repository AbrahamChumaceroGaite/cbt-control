'use client'
import { Modal }       from '@/components/ui/modal'
import { Button }      from '@/components/ui/button'
import { FormField }   from '@/components/shared/FormField'
import type { EditGameForm, GameViewModel } from '../../domain/types'

interface Props {
  game:         GameViewModel
  form:         EditGameForm
  saving:       boolean
  onClose:      () => void
  onSave:       () => void
  onFormChange: (patch: Partial<EditGameForm>) => void
}

export function GameEditModal({ game, form, saving, onClose, onSave, onFormChange }: Props) {
  const num = (val: string) => parseInt(val, 10) || 0

  return (
    <Modal open title={`Edit — ${game.title}`} onClose={onClose} size="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <FormField label="Title" required htmlFor="ge-title" className="sm:col-span-2">
          <input id="ge-title" value={form.title}
            onChange={e => onFormChange({ title: e.target.value })}
            className="w-full h-9 rounded-lg bg-zinc-800 border border-zinc-700 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </FormField>

        <FormField label="Description" htmlFor="ge-desc" className="sm:col-span-2">
          <textarea id="ge-desc" value={form.description} rows={2}
            onChange={e => onFormChange({ description: e.target.value })}
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
          />
        </FormField>

        <FormField label="Cover URL" htmlFor="ge-cover">
          <input id="ge-cover" value={form.coverUrl} placeholder="https://..."
            onChange={e => onFormChange({ coverUrl: e.target.value })}
            className="w-full h-9 rounded-lg bg-zinc-800 border border-zinc-700 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </FormField>

        <FormField label="Icon Emoji" htmlFor="ge-emoji">
          <input id="ge-emoji" value={form.iconEmoji} maxLength={4}
            onChange={e => onFormChange({ iconEmoji: e.target.value })}
            className="w-full h-9 rounded-lg bg-zinc-800 border border-zinc-700 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </FormField>

        <FormField label="Coins / level (base)" htmlFor="ge-base">
          <input id="ge-base" type="number" min={1} value={form.coinsPerLevelBase}
            onChange={e => onFormChange({ coinsPerLevelBase: num(e.target.value) })}
            className="w-full h-9 rounded-lg bg-zinc-800 border border-zinc-700 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </FormField>

        <FormField label="Coins step / level" htmlFor="ge-step">
          <input id="ge-step" type="number" min={0} value={form.coinsPerLevelStep}
            onChange={e => onFormChange({ coinsPerLevelStep: num(e.target.value) })}
            className="w-full h-9 rounded-lg bg-zinc-800 border border-zinc-700 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </FormField>

        <FormField label="Bonus coins" htmlFor="ge-bonus">
          <input id="ge-bonus" type="number" min={0} value={form.bonusCoins}
            onChange={e => onFormChange({ bonusCoins: num(e.target.value) })}
            className="w-full h-9 rounded-lg bg-zinc-800 border border-zinc-700 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </FormField>

        <FormField label="Continue cost" htmlFor="ge-cost">
          <input id="ge-cost" type="number" min={0} value={form.continueCost}
            onChange={e => onFormChange({ continueCost: num(e.target.value) })}
            className="w-full h-9 rounded-lg bg-zinc-800 border border-zinc-700 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </FormField>

        <FormField label="Max levels" htmlFor="ge-max">
          <input id="ge-max" type="number" min={1} max={100} value={form.maxLevels}
            onChange={e => onFormChange({ maxLevels: num(e.target.value) })}
            className="w-full h-9 rounded-lg bg-zinc-800 border border-zinc-700 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </FormField>

        <FormField label="Active" htmlFor="ge-active" className="flex flex-col justify-center">
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input id="ge-active" type="checkbox" checked={form.isActive}
              onChange={e => onFormChange({ isActive: e.target.checked })}
              className="w-4 h-4 accent-purple-500"
            />
            <span className="text-sm text-zinc-300">{form.isActive ? 'Visible to students' : 'Hidden'}</span>
          </label>
        </FormField>
      </div>

      <div className="flex gap-2 mt-6 pt-4 border-t border-zinc-800">
        <Button variant="outline" onClick={onClose} className="flex-1 h-10 rounded-xl text-xs">
          Cancel
        </Button>
        <Button variant="amber" onClick={onSave} loading={saving} className="flex-1 h-10 rounded-xl text-xs font-bold">
          Save changes
        </Button>
      </div>
    </Modal>
  )
}
