'use client'
import { Plus, Users }                                  from 'lucide-react'
import { Modal, Button, Input, Combobox, Grid, EmptyState } from '@/components/ui'
import { SectionHeader }  from '@/components/shared/SectionHeader'
import { Pagination }     from '@/components/shared/Pagination'
import { FilterPopover }  from '@/components/shared/FilterPopover'
import { FormField }      from '@/components/shared/FormField'
import { UserCard }       from './UserCard'
import { UserDrawer }     from './UserDrawer'
import { useUsuarios }    from '../application/useUsuarios'

const ROLE_OPTS   = [{ value: 'all', label: 'All' }, { value: 'admin', label: 'Admin' }, { value: 'student', label: 'Student' }] as const
const STATUS_OPTS = [{ value: 'all', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] as const
const PUSH_OPTS   = [{ value: 'all', label: 'All' }, { value: 'active', label: 'With push' }, { value: 'inactive', label: 'Without push' }] as const

export function UsuariosSection() {
  const s = useUsuarios()
  const h = s.handlers

  const courseFilterOpts = [
    { value: '', label: 'All' },
    ...s.courseOptions.map(c => ({ value: c, label: c })),
  ]

  return (
    <>
      <div className="space-y-4 animate-in fade-in duration-300">
        <SectionHeader
          icon={Users} iconClass="text-purple-400"
          title="System Users" subtitle="Manage access accounts."
          search={s.search} onSearch={h.setSearch}
          filters={
            <FilterPopover active={s.filtersActive} onClear={h.clearFilters}>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Role</span>
                <Combobox value={s.filters.role} onChange={v => h.updateFilter('role', v as typeof s.filters.role)}
                  options={ROLE_OPTS as unknown as { value: string; label: string }[]} placeholder="All" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Status</span>
                <Combobox value={s.filters.status} onChange={v => h.updateFilter('status', v as typeof s.filters.status)}
                  options={STATUS_OPTS as unknown as { value: string; label: string }[]} placeholder="All" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Push</span>
                <Combobox value={s.filters.push} onChange={v => h.updateFilter('push', v as typeof s.filters.push)}
                  options={PUSH_OPTS as unknown as { value: string; label: string }[]} placeholder="All" />
              </div>
              {s.courseOptions.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Course</span>
                  <Combobox value={s.filters.course} onChange={v => h.updateFilter('course', v)}
                    options={courseFilterOpts} placeholder="All courses" />
                </div>
              )}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Registered</span>
                <div className="flex items-center gap-2">
                  <input type="date" value={s.filters.from} onChange={e => h.updateFilter('from', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500" />
                  <span className="text-zinc-600 text-xs">–</span>
                  <input type="date" value={s.filters.to}   onChange={e => h.updateFilter('to',   e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-zinc-500" />
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 text-right">{s.filtered.length} result{s.filtered.length !== 1 ? 's' : ''}</p>
            </FilterPopover>
          }
          actions={
            <Button size="sm" onClick={h.openCreate}>
              <Plus className="w-3.5 h-3.5" /> New User
            </Button>
          }
        />

        <Grid cols={4} gap="sm">
          {s.paginated.map(u => (
            <UserCard key={u.id} user={u} onClick={() => h.selectUser(u)} />
          ))}
          {s.paginated.length === 0 && (
            <div className="col-span-full">
              <EmptyState icon={<Users className="w-5 h-5" />} title="No users found" />
            </div>
          )}
        </Grid>

        <Pagination page={s.page} totalItems={s.filtered.length} pageSize={s.pageSize} onPageSizeChange={sz => { s.setPageSize(sz); s.setPage(0) }} onChange={s.setPage} />
      </div>

      <UserDrawer user={s.selected} onClose={h.closeDrawer} onUpdated={h.onUserUpdated} />

      <Modal open={s.modal} onClose={h.closeCreate} title="New User">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Code (login)">
              <Input value={s.form.code} onChange={e => h.setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. s1a01 or admin" />
            </FormField>
            <FormField label="Role">
              <Combobox
                value={s.form.role}
                onChange={v => h.setForm(p => ({ ...p, role: v }))}
                options={[{ value: 'student', label: 'Student' }, { value: 'admin', label: 'Administrator' }]}
                placeholder="Select role…"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Full Name">
              <Input value={s.form.fullName} onChange={e => h.setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Display name" />
            </FormField>
            <FormField label="Password">
              <Input type="password" value={s.form.password} onChange={e => h.setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
            </FormField>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={h.closeCreate} className="flex-1">Cancel</Button>
          <Button onClick={h.create} className="flex-1">Create User</Button>
        </div>
      </Modal>
    </>
  )
}
