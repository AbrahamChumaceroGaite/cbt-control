'use client'
import { useEffect, useRef, useState } from 'react'
import { Plus, Bell, BellOff, SlidersHorizontal, X, ChevronDown, Users } from 'lucide-react'
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

type RoleFilter   = 'all' | 'admin' | 'student'
type StatusFilter = 'all' | 'active' | 'inactive'
type PushFilter   = 'all' | 'active' | 'inactive'

interface Filters {
  role:   RoleFilter
  status: StatusFilter
  push:   PushFilter
  course: string
  from:   string
  to:     string
}

const DEFAULT_FILTERS: Filters = { role: 'all', status: 'all', push: 'all', course: '', from: '', to: '' }

function isActive(f: Filters) {
  return f.role !== 'all' || f.status !== 'all' || f.push !== 'all' || f.course !== '' || f.from !== '' || f.to !== ''
}

export function UsuariosSection({ showToast }: Props) {
  const [users,       setUsers]       = useState<UserFull[]>([])
  const [modal,       setModal]       = useState(false)
  const [form,        setForm]        = useState({ code: '', password: '', role: 'student', fullName: '' })
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(0)
  const [pageSize,    setPageSize]    = useState(12)
  const [selected,    setSelected]    = useState<UserFull | null>(null)
  const [filters,     setFilters]     = useState<Filters>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  async function load() {
    const data = await usersService.getAll().catch(() => [] as UserFull[])
    setUsers(data)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!showFilters) return
    const h = (e: MouseEvent) => { if (!filterRef.current?.contains(e.target as Node)) setShowFilters(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showFilters])

  async function create() {
    try {
      const { message } = await usersService.create({ code: form.code, password: form.password, role: form.role, fullName: form.fullName })
      showToast(message)
      setModal(false)
      setForm({ code: '', password: '', role: 'student', fullName: '' })
      load()
    } catch (err: any) { showToast(err.message ?? 'Error de conexión', false) }
  }

  const courseOptions = Array.from(
    new Set(users.map(u => u.student?.course?.name).filter(Boolean) as string[])
  ).sort()

  const filtered = users.filter(u => {
    if (search) {
      const q = search.toLowerCase()
      if (!u.code.toLowerCase().includes(q) && !u.fullName.toLowerCase().includes(q)) return false
    }
    if (filters.role !== 'all' && u.role !== filters.role) return false
    if (filters.status === 'active'   && !u.isActive) return false
    if (filters.status === 'inactive' &&  u.isActive) return false
    if (filters.push === 'active'   && u.pushSubscriptionCount === 0) return false
    if (filters.push === 'inactive' && u.pushSubscriptionCount  >  0) return false
    if (filters.course && u.student?.course?.name !== filters.course) return false
    if (filters.from && new Date(u.createdAt).getTime() < new Date(filters.from).getTime()) return false
    if (filters.to   && new Date(u.createdAt).getTime() > new Date(filters.to + 'T23:59:59').getTime()) return false
    return true
  })

  const paginated   = filtered.slice(page * pageSize, (page + 1) * pageSize)
  const anyActive   = isActive(filters)

  const FilterButton = (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setShowFilters(v => !v)}
        className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
          anyActive
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filtros
        {anyActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />}
        <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
      </button>

      {showFilters && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[200] w-72 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Filtros</span>
            {anyActive && (
              <button onClick={() => { setFilters(DEFAULT_FILTERS); setPage(0) }} className="text-[10px] text-zinc-500 hover:text-amber-400 flex items-center gap-1">
                <X className="w-3 h-3" />Limpiar
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { key: 'role',   label: 'Rol',    opts: [['all','Todos'],['admin','Admin'],['student','Estudiante']] },
              { key: 'status', label: 'Estado', opts: [['all','Todos'],['active','Activos'],['inactive','Inactivos']] },
              { key: 'push',   label: 'Push',   opts: [['all','Todos'],['active','Con push'],['inactive','Sin push']] },
            ] as const).map(({ key, label, opts }) => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</label>
                <select
                  value={filters[key]}
                  onChange={e => { setFilters(p => ({ ...p, [key]: e.target.value })); setPage(0) }}
                  className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500"
                >
                  {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 uppercase tracking-wide">Curso</label>
              <select
                value={filters.course}
                onChange={e => { setFilters(p => ({ ...p, course: e.target.value })); setPage(0) }}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500"
              >
                <option value="">Todos</option>
                {courseOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wide">Registro</label>
            <div className="flex items-center gap-2">
              <input type="date" value={filters.from}
                onChange={e => { setFilters(p => ({ ...p, from: e.target.value })); setPage(0) }}
                className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500" />
              <span className="text-zinc-600 text-xs">–</span>
              <input type="date" value={filters.to}
                onChange={e => { setFilters(p => ({ ...p, to: e.target.value })); setPage(0) }}
                className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-600 text-right">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      <div className="space-y-4 animate-in fade-in duration-300">
        <SectionHeader
          icon={Users}
          iconClass="text-purple-400"
          title="Usuarios del Sistema"
          subtitle="Gestiona las cuentas de acceso al panel."
          search={search}
          onSearch={v => { setSearch(v); setPage(0) }}
          filters={FilterButton}
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
            const roleBadge = isAdmin ? 'bg-purple-900/50 text-purple-300' : 'bg-blue-900/50 text-blue-300'
            const avatarLetter = u.fullName
              ? u.fullName.trim().charAt(0).toUpperCase()
              : (u.code.replace(/\d/g, '').charAt(0) || u.code.charAt(0)).toUpperCase()

            return (
              <button
                key={u.id}
                onClick={() => setSelected(u)}
                className={`group relative text-left w-full bg-zinc-900/60 border rounded-xl p-4 hover:bg-zinc-900/90 hover:shadow-lg transition-all duration-200 ${aura}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base font-black flex-shrink-0 ${avatarBg}`}>
                    {avatarLetter}
                  </div>
                  <div className="min-w-0 flex-1 pr-5">
                    <p className="text-sm font-semibold text-zinc-100 truncate leading-tight">{u.fullName || u.code}</p>
                    {u.fullName && <p className="text-[11px] text-zinc-500 font-mono truncate">{u.code}</p>}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${roleBadge}`}>
                        {isAdmin ? 'Admin' : 'Estudiante'}
                      </span>
                      <span className={`text-[10px] font-medium ${u.isActive ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        {u.isActive ? '● Activo' : '● Inactivo'}
                      </span>
                      {u.student?.course && (
                        <span className="text-[10px] text-zinc-600">{u.student.course.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  {hasPush
                    ? <Bell className="w-3 h-3 text-emerald-400" />
                    : <BellOff className="w-3 h-3 text-zinc-700" />
                  }
                </div>
              </button>
            )
          })}

          {paginated.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-600 text-sm">Sin usuarios</div>
          )}
        </div>

        <Pagination
          page={page} totalItems={filtered.length} pageSize={pageSize}
          onPageSizeChange={s => { setPageSize(s); setPage(0) }} onChange={setPage}
        />
      </div>

      <UserDrawer
        user={selected}
        onClose={() => setSelected(null)}
        onUpdated={() => { load(); setSelected(null) }}
        showToast={showToast}
      />

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
