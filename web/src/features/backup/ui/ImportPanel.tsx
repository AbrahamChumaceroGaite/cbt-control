'use client'
import type { ChangeEvent, RefObject } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui'
import type { RestoreResult } from '../domain/types'

const DETAIL_LABELS: Record<string, string> = {
  courses: 'Courses', students: 'Students', groups: 'Groups',
  actions: 'Actions', rewards: 'Rewards', coinLogs: 'History', solicitudes: 'Requests',
}

interface Props {
  importing:     boolean
  importResult:  RestoreResult | null
  importFileRef: RefObject<HTMLInputElement>
  onImport:      (e: ChangeEvent<HTMLInputElement>) => void
}

export function ImportPanel({ importing, importResult, importFileRef, onImport }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
          <Upload className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">Import backup</p>
          <p className="text-xs text-zinc-500 mt-0.5">Upload a .json file — existing records are updated, new ones are created.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input ref={importFileRef} type="file" accept=".json" className="hidden" onChange={onImport} />
        <Button variant="secondary" size="sm" onClick={() => importFileRef.current?.click()} disabled={importing}>
          <Upload className="w-4 h-4 mr-2" />
          {importing ? 'Importing…' : 'Select JSON file'}
        </Button>
        {importing && <span className="text-xs text-zinc-500 animate-pulse">Processing data…</span>}
      </div>
      {importResult && (
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 space-y-2">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Last import — {importResult.detected.length} section(s) detected
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(importResult.details).map(([key, val]) => {
              if (!val) return null
              const label = DETAIL_LABELS[key] ?? key
              const parts: string[] = []
              if ('updated' in val && (val.updated ?? 0) > 0) parts.push(`${val.updated} updated`)
              if (val.created > 0) parts.push(`${val.created} new`)
              if (parts.length === 0) parts.push('no changes')
              return (
                <span key={key} className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                  <span className="text-zinc-400">{label}:</span> {parts.join(', ')}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
