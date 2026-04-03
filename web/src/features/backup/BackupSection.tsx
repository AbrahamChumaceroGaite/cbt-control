'use client'
import { useRef, useState } from 'react'
import { Download, Upload, Database } from 'lucide-react'
import { Button }        from '@/components/ui'
import { backupService, type RestoreResult } from '@/services/backup.service'

const EXPORT_SECTIONS = [
  { key: 'courses',     label: 'Cursos, Alumnos y Grupos', desc: 'Toda la estructura de clases' },
  { key: 'actions',     label: 'Catálogo de Acciones',     desc: 'Comportamientos y puntos' },
  { key: 'rewards',     label: 'Catálogo de Premios',      desc: 'Recompensas disponibles' },
  { key: 'coinLogs',    label: 'Historial de Coins',       desc: 'Últimas 5 000 transacciones' },
  { key: 'solicitudes', label: 'Solicitudes de Canje',     desc: 'Historial de solicitudes' },
]

const DETAIL_LABELS: Record<string, string> = {
  courses:     'Cursos',
  students:    'Alumnos',
  groups:      'Grupos',
  actions:     'Acciones',
  rewards:     'Premios',
  coinLogs:    'Historial',
  solicitudes: 'Solicitudes',
}

interface Props {
  showToast: (msg: string, ok?: boolean) => void
  reloadAll: () => void
}

export function BackupSection({ showToast, reloadAll }: Props) {
  const [exportSections, setExportSections] = useState<Set<string>>(
    () => new Set(['courses', 'actions', 'rewards'])
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
    if (exportSections.size === 0) { showToast('Selecciona al menos una sección', false); return }
    setExporting(true)
    try {
      const res = await backupService.download(Array.from(exportSections))
      if (!res.ok) { showToast('Error al generar el backup', false); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `backup-cbt-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Backup descargado correctamente')
    } catch (err: any) {
      showToast(err.message ?? 'Error de conexión', false)
    } finally { setExporting(false) }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      if (!json.version || !json.exportedAt) throw new Error('Archivo no válido — no parece un backup de CBT')
      const result = await backupService.restore(json)
      setImportResult(result)
      showToast(`Importación completada — ${result.detected.length} sección(es) procesada(s)`)
      reloadAll()
    } catch (err: any) {
      showToast(err.message ?? 'Error al importar', false)
    } finally {
      setImporting(false)
      if (importFileRef.current) importFileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ── Export ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Exportar datos</p>
            <p className="text-xs text-zinc-500 mt-0.5">Selecciona las secciones a incluir en el archivo JSON.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXPORT_SECTIONS.map(s => (
            <label
              key={s.key}
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportSections.has(s.key)
                  ? 'border-zinc-600 bg-zinc-800/60'
                  : 'border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700'
              }`}
            >
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-amber-500 flex-shrink-0"
                checked={exportSections.has(s.key)}
                onChange={() => toggleSection(s.key)}
              />
              <div>
                <p className="text-sm font-medium text-zinc-200 leading-tight">{s.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{s.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            variant="secondary" size="sm"
            onClick={downloadBackup}
            disabled={exporting || exportSections.size === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Generando…' : `Exportar (${exportSections.size} secc.)`}
          </Button>
        </div>
      </div>

      {/* ── Import ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
            <Upload className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Importar backup</p>
            <p className="text-xs text-zinc-500 mt-0.5">Sube un archivo .json — registros existentes se actualizan, nuevos se crean.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input ref={importFileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Button
            variant="secondary" size="sm"
            onClick={() => importFileRef.current?.click()}
            disabled={importing}
          >
            <Upload className="w-4 h-4 mr-2" />
            {importing ? 'Importando…' : 'Seleccionar archivo JSON'}
          </Button>
          {importing && <span className="text-xs text-zinc-500 animate-pulse">Procesando datos…</span>}
        </div>

        {importResult && (
          <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 space-y-2">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Última importación — {importResult.detected.length} sección(es) detectada(s)
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(importResult.details).map(([key, val]) => {
                if (!val) return null
                const label = DETAIL_LABELS[key] ?? key
                const parts: string[] = []
                if ('updated' in val && (val.updated ?? 0) > 0) parts.push(`${val.updated} actualizados`)
                if (val.created > 0) parts.push(`${val.created} nuevos`)
                if (parts.length === 0) parts.push('sin cambios')
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

      {/* ── Info card ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-zinc-800/50 bg-zinc-900/20 text-xs text-zinc-500">
        <Database className="w-4 h-4 flex-shrink-0 mt-0.5 text-zinc-600" />
        <p>Los backups son archivos JSON portables. La importación es inteligente: actualiza lo que existe y crea lo que falta, sin borrar datos no incluidos.</p>
      </div>
    </div>
  )
}
