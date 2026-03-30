'use client'
import { useEffect, useState } from 'react'
import { Plus, UserCog, X } from 'lucide-react'
import type { CourseResponse } from '@control-aula/shared'
import { Modal, Button, Input, Label, Select, Tooltip } from '@/components/ui'
import { usersService, type UserFull } from '@/services/users.service'
import { backupService } from '@/services/backup.service'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Pagination }    from '@/components/shared/Pagination'
import { Download, DatabaseBackup } from 'lucide-react'

interface UsuariosSectionProps {
  courses: CourseResponse[]
  showToast: (msg: string, ok?: boolean) => void
}

export function UsuariosSection({ courses, showToast }: UsuariosSectionProps) {
  const [users, setUsers]           = useState<UserFull[]>([])
  const [modal, setModal]           = useState(false)
  const [editUser, setEditUser]     = useState<UserFull | null>(null)
  const [form, setForm]             = useState({ code: '', password: '', role: 'student', fullName: '', isActive: true })
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(0)
  const [pageSize, setPageSize]     = useState(10)
  const [processing, setProcessing] = useState<string | null>(null)
  const [backupLoading, setBackupLoading] = useState(false)

  async function load() {
    const data = await usersService.getAll().catch(() => [] as UserFull[])
    setUsers(data)
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditUser(null); setForm({ code: '', password: '', role: 'student', fullName: '', isActive: true }); setModal(true) }
  function openEdit(u: UserFull) { setEditUser(u); setForm({ code: u.code, password: '', role: u.role, fullName: u.fullName, isActive: u.isActive }); setModal(true) }

  async function save() {
    try {
      if (editUser) {
        const body: { fullName: string; isActive: boolean; password?: string } = { fullName: form.fullName, isActive: form.isActive }
        if (form.password) body.password = form.password
        await usersService.update(editUser.id, body)
        showToast('Usuario actualizado')
      } else {
        await usersService.create({ code: form.code, password: form.password, role: form.role, fullName: form.fullName })
        showToast('Usuario creado')
      }
      setModal(false)
      load()
    } catch { showToast('Error de conexión', false) }
  }

  async function toggleActive(u: UserFull) {
    setProcessing(u.id)
    try {
      await usersService.update(u.id, { isActive: !u.isActive })
      showToast(u.isActive ? 'Usuario desactivado' : 'Usuario activado', !u.isActive)
      load()
    } finally { setProcessing(null) }
  }

  async function remove(u: UserFull) {
    if (!confirm(`¿Eliminar usuario ${u.code}?`)) return
    setProcessing(u.id)
    try {
      await usersService.delete(u.id)
      showToast('Usuario eliminado')
      load()
    } finally { setProcessing(null) }
  }

  async function downloadBackup() {
    setBackupLoading(true)
    try {
      const res = await backupService.download()
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
      setBackupLoading(false)
    }
  }

  const filtered  = users.filter(u => !search || u.code.includes(search.toLowerCase()) || u.fullName.toLowerCase().includes(search.toLowerCase()))
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="space-y-6">
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

      {/* Backup inline */}
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
        <Button variant="secondary" size="sm" onClick={downloadBackup} disabled={backupLoading} className="flex-shrink-0">
          <Download className="w-4 h-4" />
          {backupLoading ? 'Generando...' : 'Descargar'}
        </Button>
      </div>

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
