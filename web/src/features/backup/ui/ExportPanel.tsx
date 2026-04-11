'use client'
import { Download } from 'lucide-react'
import { Button, Checkbox } from '@/components/ui'

const EXPORT_SECTIONS = [
  { key: 'courses',     label: 'Courses, Students & Groups', desc: 'Full class structure'    },
  { key: 'actions',     label: 'Actions catalog',            desc: 'Behaviours and points'   },
  { key: 'rewards',     label: 'Rewards catalog',            desc: 'Available rewards'       },
  { key: 'coinLogs',    label: 'Coin history',               desc: 'Last 5 000 transactions' },
  { key: 'solicitudes', label: 'Redemption requests',        desc: 'Redemption history'      },
]

interface Props {
  selected:       Set<string>
  exporting:      boolean
  onToggle:       (key: string) => void
  onDownload:     () => void
}

export function ExportPanel({ selected, exporting, onToggle, onDownload }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">Export data</p>
          <p className="text-xs text-zinc-500 mt-0.5">Select the sections to include in the JSON file.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {EXPORT_SECTIONS.map(s => (
          <label key={s.key} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${selected.has(s.key) ? 'border-zinc-600 bg-zinc-800/60' : 'border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700'}`}>
            <Checkbox checked={selected.has(s.key)} onCheckedChange={() => onToggle(s.key)} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-zinc-200 leading-tight">{s.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{s.desc}</p>
            </div>
          </label>
        ))}
      </div>
      <div className="flex justify-end">
        <Button variant="secondary" size="sm" onClick={onDownload} disabled={exporting || selected.size === 0}>
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Generating…' : `Export (${selected.size} sect.)`}
        </Button>
      </div>
    </div>
  )
}
