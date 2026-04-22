'use client'
import { useRef }          from 'react'
import { Upload, Check }   from 'lucide-react'
import { Modal }           from '@/components/ui/modal'
import { Button }          from '@/components/ui/button'
import { FormField }       from '@/components/shared/FormField'
import { Spinner }         from '@/components/ui/spinner'
import type { EditGameForm, GameViewModel } from '../../domain/types'
import type { useGameUpload }              from '../../application/useGameUpload'

type UploadHook = ReturnType<typeof useGameUpload>
type FileSlot   = 'game' | 'bios' | 'cover'

interface Props {
  game:         GameViewModel
  form:         EditGameForm
  saving:       boolean
  upload:       UploadHook
  onClose:      () => void
  onSave:       () => void
  onFormChange: (patch: Partial<EditGameForm>) => void
}

function FileSlotRow({
  label, hint, slot, currentUrl, game, upload,
}: {
  label:      string
  hint:       string
  slot:       FileSlot
  currentUrl: string
  game:       GameViewModel
  upload:     UploadHook
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const state    = upload.slotState[slot]

  return (
    <div className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-300">{label}</p>
        <p className="text-[10px] text-zinc-600 truncate">{currentUrl || hint}</p>
      </div>
      {currentUrl && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) upload.upload(game, slot, file)
          e.target.value = ''
        }}
      />
      <button
        disabled={state.uploading}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        {state.uploading
          ? <><Spinner className="w-3 h-3" /> Uploading…</>
          : <><Upload className="w-3 h-3" /> {currentUrl ? 'Replace' : 'Upload'}</>
        }
      </button>
    </div>
  )
}

export function GameEditModal({ game, form, saving, upload, onClose, onSave, onFormChange }: Props) {
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

        <FormField label="Icon Emoji" htmlFor="ge-emoji">
          <input id="ge-emoji" value={form.iconEmoji} maxLength={4}
            onChange={e => onFormChange({ iconEmoji: e.target.value })}
            className="w-full h-9 rounded-lg bg-zinc-800 border border-zinc-700 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </FormField>

        <FormField label="Emulator core" htmlFor="ge-core">
          <input id="ge-core" value={form.emulatorCore} placeholder="psx / n64 / gba / snes…"
            onChange={e => onFormChange({ emulatorCore: e.target.value })}
            className="w-full h-9 rounded-lg bg-zinc-800 border border-zinc-700 px-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
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

        <FormField label="Max levels (0 = no level system)" htmlFor="ge-max">
          <input id="ge-max" type="number" min={0} max={100} value={form.maxLevels}
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

      {/* ── Cloud file assets ─────────────────────────────────────────────── */}
      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
          Game files — uploaded directly to MinIO
        </p>
        <FileSlotRow label="Game ROM / CUE" hint="No file uploaded yet"
          slot="game" currentUrl={game.gameFileUrl ?? ''} game={game} upload={upload} />
        <FileSlotRow label="BIOS" hint="Only needed for console emulators"
          slot="bios" currentUrl={game.biosFileUrl ?? ''} game={game} upload={upload} />
        <FileSlotRow label="Cover image" hint="JPG or PNG, shown in the game card"
          slot="cover" currentUrl={game.coverUrl ?? ''} game={game} upload={upload} />
      </div>

      <div className="flex gap-2 mt-5 pt-4 border-t border-zinc-800">
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
