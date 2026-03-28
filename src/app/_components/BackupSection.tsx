'use client'
import { useState } from 'react'
import { Download, DatabaseBackup } from 'lucide-react'
import { Button } from '@/components/ui'

interface BackupSectionProps {
  showToast: (msg: string, ok?: boolean) => void
}

export function BackupSection({ showToast }: BackupSectionProps) {
  const [loading, setLoading] = useState(false)

  async function downloadBackup() {
    setLoading(true)
    try {
      const res = await fetch('/api/backup')
      if (!res.ok) { showToast('Error al generar el backup', false); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `backup-cbt-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showToast('Backup descargado correctamente')
    } catch {
      showToast('Error de conexión', false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
          <DatabaseBackup className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-200">Backup de datos</p>
          <p className="text-xs text-zinc-500">Exporta todos los cursos, estudiantes, acciones, premios y registros en un archivo JSON.</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={downloadBackup} disabled={loading} className="flex-shrink-0">
        <Download className="w-4 h-4" />
        {loading ? 'Generando...' : 'Descargar'}
      </Button>
    </div>
  )
}
