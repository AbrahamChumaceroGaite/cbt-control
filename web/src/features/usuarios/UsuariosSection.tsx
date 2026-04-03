'use client'
import { useEffect, useRef, useState } from 'react'
import { Plus, UserCog, X, Upload, Download } from 'lucide-react'
import type { CourseResponse } from '@control-aula/shared'
import { Modal, Button, Input, Label, Select, Tooltip } from '@/components/ui'
import { usersService, type UserFull } from '@/services/users.service'
import { backupService, type RestoreResult } from '@/services/backup.service'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Pagination }    from '@/components/shared/Pagination'

interface UsuariosSectionProps {
  courses: CourseResponse[]
  showToast: (msg: string, ok?: boolean) => void
  reloadAll: () => void
}

// ── Export sections ──────────────────────────────────────────────────────────
const EXPORT_SECTIONS = [
  { key: 'courses',    label: 'Cursos, Alumnos y Grupos', desc: 'Toda la estructura de clases' },
  { key: 'actions',    label: 'Catálogo de Acciones',     desc: 'Comportamientos y puntos' },
  { key: 'rewards',    label: 'Catálogo de Premios',      desc: 'Recompensas disponibles' },
  { key: 'coinLogs',   label: 'Historial de Coins',       desc: 'Últimas 5 000 transacciones' },
  { key: 'solicitudes',label: 'Solicitudes de Canje',     desc: 'Historial de solicitudes' },
]

const DETAIL_LABELS: Record<string, string> = {
  courses:    'Cursos',
  students:   'Alumnos',
  groups:     'Grupos',
  actions:    'Acciones',
  rewards:    'Premios',
  coinLogs:   'Historial',
  solicitudes:'Solicitudes',
}

// ── Component ────────────────────────────────────────────────────────────────
export function UsuariosSection({ courses, showToast, reloadAll }: UsuariosSectionProps) {
  const [users, setUsers]           = useState<UserFull[]>([])
  const [modal, setModal]           = useState(false)
  const [editUser, setEditUser]     = useState<UserFull | null>(null)
  const [form, setForm]             = useState({ code: '', password: '', role: 'student', fullName: '', isActive: true })
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(0)
  const [pageSize, setPageSize]     = useState(10)
  const [processing, setProcessing] = useState<string | null>(null)

  // Export state
  const [exportSections, setExportSections] = useState<Set<string>>(
    () => new Set(['courses', 'actions', 'rewards'])
  )
  const [exporting, setExporting] = useState(false)

  // Import state
  const [importing, setImporting]       = useState(false)
  const [importResult, setImportResult] = useState<RestoreResult | null>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const data = await usersService.getAll().catch(() => [] as UserFull[])
    setUsers(data)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditUser(null); setForm({ code: '', password: '', role: 'student', fullName: '', isActive: true }); setModal(true) }
  function openEdit(u: UserFull) { setEditUser(u); setForm({ code: u.code, password: '', role: u.role, fullName: u.fullName, isActive: u.isActive }); setModal(true) }

  async function save() {
    try {
      let message: string
      if (editUser) {
        const body: { fullName: string; isActive: boolean; password?: string } = { fullName: form.fullName, isActive: form.isActive }
        if (form.password) body.password = form.password
        ;({ message } = await usersService.update(editUser.id, body))
      } else {
        ;({ message } = await usersService.create({ code: form.code, password: form.password, role: form.role, fullName: form.fullName }))
      }
      showToast(message)
      setModal(false)
      load()
    } catch (err: any) { showToast(err.message ?? 'Error de conexión', false) }
  }

  async function toggleActive(u: UserFull) {
    setProcessing(u.id)
    try {
      const { message } = await usersService.update(u.id, { isActive: !u.isActive })
      showToast(message, !u.isActive)
      load()
    } catch (err: any) {
      showToast(err.message ?? 'Error al actualizar usuario', false)
    } finally { setProcessing(null) }
  }

  async function remove(u: UserFull) {
    if (!confirm(`¿Eliminar usuario ${u.code}?`)) return
    setProcessing(u.id)
    try {
      const { message } = await usersService.delete(u.id)
      showToast(message)
      load()
    } catch (err: any) {
      showToast(err.message ?? 'Error al eliminar usuario', false)
    } finally { setProcessing(null) }
  }

  // ── Export ──────────────────────────────────────────────────────────────
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
      showToast('Backup descargado')
    } catch (err: any) {
      showToast(err.message ?? 'Error de conexión', false)
    } finally { setExporting(false) }
  }

  // ── Import ──────────────────────────────────────────────────────────────
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
      load()
    } catch (err: any) {
      showToast(err.message ?? 'Error al importar', false)
    } finally {
      setImporting(false)
      if (importFileRef.current) importFileRef.current.value = ''
    }
  }

  const filtered  = users.filter(u => !search || u.code.includes(search.toLowerCase()) || u.fullName.toLowerCase().includes(search.toLowerCase()))
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="space-y-6">
      {/* ── Tabla de usuarios ───────────────────────────────────────────── */}
      <SectionHeader
        title="Usuarios del Sistema" subtitle="Gestiona las cuentas de acceso al panel."
        search={search} onSearch={v => { setSearch(v); setPage(0) }}
        actions={
          <Tooltip content="Nuevo usuario">
            <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4" /></Button>
          </Tooltip>
        }
      />

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Nombre</th>
              <th className="text-left px-4 py-3">Rol</th>
              <th className="text-left px-4 py-3">Estudiante</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {paginated.map(u => (
              <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 font-mono text-zinc-300">{u.code}</td>
                <td className="px-4 py-3 text-zinc-200">{u.fullName || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-900/50 text-purple-400' : 'bg-blue-900/50 text-blue-400'}`}>
                    {u.role === 'admin' ? 'Admin' : 'Estudiante'}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">
                  {u.student ? `${u.student.name} (${u.student.course?.name ?? '—'})` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${u.isActive ? 'text-green-400' : 'text-zinc-600'}`}>{u.isActive ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Tooltip content="Editar usuario">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"><UserCog className="w-3.5 h-3.5" /></button>
                    </Tooltip>
                    <Tooltip content={u.isActive ? 'Desactivar' : 'Activar'}>
                      <button onClick={() => toggleActive(u)} disabled={processing === u.id} className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors text-xs">
                        {u.isActive ? '⏸' : '▶'}
                      </button>
                    </Tooltip>
                    {u.role !== 'admin' && (
                      <Tooltip content="Eliminar usuario">
                        <button onClick={() => remove(u)} disabled={processing === u.id} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors"><X className="w-3.5 h-3.5" /></button>
                      </Tooltip>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-zinc-600">Sin usuarios</td></tr>}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalItems={filtered.length} pageSize={pageSize}
        onPageSizeChange={s => { setPageSize(s); setPage(0) }} onChange={setPage} />

      {/* ── Export ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
            <Download className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">Exportar backup</p>
            <p className="text-xs text-zinc-500">Selecciona qué secciones incluir en el archivo JSON.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXPORT_SECTIONS.map(s => (
            <label key={s.key} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-blue-500"
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
          <Button variant="secondary" size="sm" onClick={downloadBackup} disabled={exporting || exportSections.size === 0}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Generando...' : `Descargar JSON (${exportSections.size} secc.)`}
          </Button>
        </div>
      </div>

      {/* ── Import ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
            <Upload className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">Importar backup</p>
            <p className="text-xs text-zinc-500">Sube un archivo .json — los registros existentes se actualizan, los nuevos se crean automáticamente.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={importFileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => importFileRef.current?.click()}
            disabled={importing}
          >
            <Upload className="w-4 h-4 mr-2" />
            {importing ? 'Importando...' : 'Seleccionar archivo JSON'}
          </Button>
          {importing && <span className="text-xs text-zinc-500 animate-pulse">Procesando datos…</span>}
        </div>

        {/* Resultado de la última importación */}
        {importResult && (
          <div className="rounded-lg border border-emerald-800/50 bg-emerald-950/20 p-4 space-y-2">
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

      {/* ── Modal de usuario ─────────────────────────────────────────── */}
      <Modal open={modal} onClose={() => setModal(false)} title={editUser ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <div className="space-y-4">
          {!editUser && (
            <>
              <div className="space-y-1.5"><Label>Código (login)</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="ej. s1a01 o admin" /></div>
              <div className="space-y-1.5">
                <Label>Rol</Label>
                <Select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="student">Estudiante</option>
                  <option value="admin">Administrador</option>
                </Select>
              </div>
            </>
          )}
          <div className="space-y-1.5"><Label>Nombre Completo</Label><Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Nombre para mostrar" /></div>
          {(!editUser || form.role === 'admin') && (
            <div className="space-y-1.5"><Label>{editUser ? 'Nueva Contraseña (vacío = sin cambio)' : 'Contraseña'}</Label><Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" /></div>
          )}
          {editUser && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700 bg-zinc-900" />
              <span className="text-sm text-zinc-300">Cuenta activa</span>
            </label>
          )}
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => setModal(false)} className="flex-1">Cancelar</Button>
          <Button onClick={save} className="flex-1">{editUser ? 'Guardar' : 'Crear Usuario'}</Button>
        </div>
      </Modal>
    </div>
  )
}
