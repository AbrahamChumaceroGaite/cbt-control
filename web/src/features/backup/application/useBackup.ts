import { useRef, useState }      from 'react'
import type { ChangeEvent }       from 'react'
import { backupService }          from '../infrastructure/backup.service'
import { useToast }               from '@/hooks/useToast'
import type { RestoreResult }     from '../domain/types'

export function useBackup() {
  const { showToast } = useToast()
  const [exportSections, setExportSections] = useState<Set<string>>(
    () => new Set(['courses', 'actions', 'rewards']),
  )
  const [exporting,    setExporting]    = useState(false)
  const [importing,    setImporting]    = useState(false)
  const [importResult, setImportResult] = useState<RestoreResult | null>(null)
  const importFileRef  = useRef<HTMLInputElement>(null)

  function toggleSection(key: string) {
    setExportSections(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  async function downloadBackup() {
    if (exportSections.size === 0) { showToast('Select at least one section', false); return }
    setExporting(true)
    try {
      const res = await backupService.download(Array.from(exportSections))
      if (!res.ok) { showToast('Error generating backup', false); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `backup-cbt-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Backup downloaded successfully')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Connection error', false)
    } finally { setExporting(false) }
  }

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const text = await file.text()
      const json = JSON.parse(text) as { version?: unknown; exportedAt?: unknown }
      if (!json.version || !json.exportedAt) throw new Error('Invalid file — does not appear to be a CBT backup')
      const result = await backupService.restore(json)
      setImportResult(result)
      showToast(`Import complete — ${result.detected.length} section(s) processed`)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Import error', false)
    } finally {
      setImporting(false)
      if (importFileRef.current) importFileRef.current.value = ''
    }
  }

  return {
    exportSections, exporting, importing, importResult, importFileRef,
    toggleSection, downloadBackup, handleImport,
  }
}
