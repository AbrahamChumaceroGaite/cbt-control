'use client'
import { Database } from 'lucide-react'
import { useBackup }      from '../application/useBackup'
import { ExportPanel }    from './ExportPanel'
import { ImportPanel }    from './ImportPanel'

export function BackupSection() {
  const { exportSections, exporting, importing, importResult, importFileRef, toggleSection, downloadBackup, handleImport } = useBackup()

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ExportPanel
        selected={exportSections}
        exporting={exporting}
        onToggle={toggleSection}
        onDownload={downloadBackup}
      />
      <ImportPanel
        importing={importing}
        importResult={importResult}
        importFileRef={importFileRef}
        onImport={handleImport}
      />
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-zinc-800/50 bg-zinc-900/20 text-xs text-zinc-500">
        <Database className="w-4 h-4 flex-shrink-0 mt-0.5 text-zinc-600" />
        <p>Backups are portable JSON files. Import is smart: it updates existing records and creates missing ones, without deleting data not included.</p>
      </div>
    </div>
  )
}
