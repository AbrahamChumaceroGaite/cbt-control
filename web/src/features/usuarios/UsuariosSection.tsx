'use client'
import { useEffect, useState } from 'react'
import { Plus, Bell, BellOff } from 'lucide-react'
import type { CourseResponse } from '@control-aula/shared'
import { Modal, Button, Input, Label, Select, Tooltip } from '@/components/ui'
import { usersService, type UserFull } from '@/services/users.service'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Pagination }    from '@/components/shared/Pagination'
import { UserDrawer }    from './UserDrawer'

interface Props {
  courses:   CourseResponse[]
  showToast: (msg: string, ok?: boolean) => void
  reloadAll: () => void
}

export function UsuariosSection({ showToast }: Props) {
  const [users,    setUsers]    = useState<UserFull[]>([])
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState({ code: '', password: '', role: 'student', fullName: '' })
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(0)
  const [pageSize, setPageSize] = useState(12)
  const [selected, setSelected] = useState<UserFull | null>(null)

  async function load() {
    const data = await usersService.getAll().catch(() => [] as UserFull[])
    setUsers(data)
  }

  useEffect(() => { load() }, [])

  async function create() {
    try {
      const { message } = await usersService.create({ code: form.code, password: form.password, role: form.role, fullName: form.fullName })
      showToast(message)
      setModal(false)
      setForm({ code: '', password: '', role: 'student', fullName: '' })
      load()
    } catch (err: any) { showToast(err.message ?? 'Error de conexión', false) }
  }

  const filtered  = users.filter(u =>
    !search ||
    u.code.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName.toLowerCase().includes(search.toLowerCase())
  )
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <>
      <div className="space-y-4 animate-in fade-in duration-300">
        <SectionHeader
          title="Usuarios del Sistema"
          subtitle="Gestiona las cuentas de acceso al panel."
          search={search}
          onSearch={v => { setSearch(v); setPage(0) }}
          actions={
            <Tooltip content="Nuevo usuario">
              <Button size="sm" onClick={() => setModal(true)}><Plus className="w-4 h-4" /></Button>
            </Tooltip>
          }
        />

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {paginated.map(u => {
            const isAdmin   = u.role === 'admin'
            const hasPush   = u.pushSubscriptionCount > 0
            const aura      = isAdmin
              ? 'border-purple-500/25 hover:border-purple-500/50 hover:shadow-purple-500/10'
              : 'border-blue-500/20 hover:border-blue-500/40 hover:shadow-blue-500/8'
            const avatarBg  = isAdmin
              ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
              : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
            const roleBadge = isAdmin
              ? 'bg-purple-900/50 text-purple-300'
              : 'bg-blue-900/50 text-blue-300'

            return (
              <button
                key={u.id}
                onClick={() => setSelected(u)}
                className={`group relative text-left w-full bg-zinc-900/60 border rounded-xl p-4 hover:bg-zinc-900/90 hover:shadow-lg transition-all duration-200 ${aura}`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base font-black flex-shrink-0 ${avatarBg}`}>
                    {(u.fullName || u.code).charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-100 truncate leading-tight">
                      {u.fullName || u.code}
                    </p>
                    <p className="text-[11px] text-zinc-500 font-mono truncate">{u.code}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${roleBadge}`}>
                        {isAdmin ? 'Admin' : 'Estudiante'}
                      </span>
                      <span className={`text-[10px] font-medium ${u.isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        {u.isActive ? '● Activo' : '● Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Push indicator */}
                <div className="absolute top-3 right-3">
                  {hasPush
                    ? <Bell className="w-3 h-3 text-emerald-400" />
                    : <BellOff className="w-3 h-3 text-zinc-700" />
                  }
                </div>

                {/* Student info */}
                {u.student && (
                  <p className="mt-2.5 text-[11px] text-zinc-600 truncate border-t border-zinc-800/50 pt-2">
                    {u.student.name}{u.student.course ? ` · ${u.student.course.name}` : ''}
                  </p>
                )}
              </button>
            )
          })}

          {paginated.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-600 text-sm">
              Sin usuarios
            </div>
          )}
        </div>

        <Pagination
          page={page}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageSizeChange={s => { setPageSize(s); setPage(0) }}
          onChange={setPage}
        />
      </div>

      {/* Drawer */}
      <UserDrawer
        user={selected}
        onClose={() => setSelected(null)}
        onUpdated={() => { load(); setSelected(null) }}
        showToast={showToast}
      />

      {/* Create modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Nuevo Usuario">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Código (login)</Label>
            <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="ej. s1a01 o admin" />
          </div>
          <div className="space-y-1.5">
            <Label>Rol</Label>
            <Select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="student">Estudiante</option>
              <option value="admin">Administrador</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Nombre Completo</Label>
            <Input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Nombre para mostrar" />
          </div>
          <div className="space-y-1.5">
            <Label>Contraseña</Label>
            <Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => setModal(false)} className="flex-1">Cancelar</Button>
          <Button onClick={create} className="flex-1">Crear Usuario</Button>
        </div>
      </Modal>
    </>
  )
}
