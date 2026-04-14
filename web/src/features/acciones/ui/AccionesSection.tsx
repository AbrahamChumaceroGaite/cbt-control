'use client'
import { Plus, Zap } from 'lucide-react'
import { Grid }              from '@/components/ui/grid'
import { Button, Combobox }  from '@/components/ui'
import { SectionHeader }     from '@/components/shared/SectionHeader'
import { Pagination }        from '@/components/shared/Pagination'
import { ConfirmDialog }     from '@/components/shared/ConfirmDialog'
import { FilterPopover }     from '@/components/shared/FilterPopover'
import { useAcciones }       from '../application/useAcciones'
import { ActionCard }        from './ActionCard'
import { ActionFormModal }   from './ActionFormModal'
import { ACTION_CATEGORIES } from '../domain/types'

const STATUS_OPTS = [
  { value: 'all',      label: 'All'      },
  { value: 'active',   label: 'Active'   },
  { value: 'inactive', label: 'Inactive' },
] as const

const SCOPE_OPTS = [
  { value: 'all',     label: 'All'          },
  { value: 'class',   label: 'Class only'   },
  { value: 'student', label: 'Student only' },
] as const

export function AccionesSection() {
  const s = useAcciones()
  const h = s.handlers

  return (
    <div className="animate-in fade-in duration-300">
      <SectionHeader
        icon={Zap} iconClass="text-amber-400"
        title="Action Catalogue"
        subtitle="Configure behaviours and their scores."
        search={s.search} onSearch={h.setSearch}
        filters={
          <FilterPopover active={s.filtersActive} onClear={h.clearFilters}>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Category</span>
              <Combobox value={s.filters.category} onChange={v => h.setFilter('category', v)}
                options={[{ value: 'all', label: 'All' }, ...ACTION_CATEGORIES]} placeholder="All categories" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Status</span>
              <Combobox value={s.filters.status}
                onChange={v => h.setFilter('status', v as typeof s.filters.status)}
                options={STATUS_OPTS as unknown as { value: string; label: string }[]} placeholder="All" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Scope</span>
              <Combobox value={s.filters.scope}
                onChange={v => h.setFilter('scope', v as typeof s.filters.scope)}
                options={SCOPE_OPTS as unknown as { value: string; label: string }[]} placeholder="All" />
            </div>
          </FilterPopover>
        }
        actions={
          <Button size="sm" onClick={h.openCreate}>
            <Plus className="w-3.5 h-3.5" /> New Action
          </Button>
        }
      />

      <Grid cols={3}>
        {s.items.map(a => (
          <ActionCard key={a.id} action={a} onEdit={() => h.openEdit(a)} onDelete={() => h.requestDelete(a.id)} />
        ))}
        {s.totalItems === 0 && !s.loading && (
          <p className="col-span-full text-center py-12 text-zinc-500">No actions found.</p>
        )}
      </Grid>

      <div className="mt-4">
        <Pagination page={s.page} totalItems={s.totalItems} pageSize={s.pageSize}
          onPageSizeChange={size => { s.setPageSize(size); s.setPage(0) }} onChange={s.setPage} />
      </div>

      <ActionFormModal open={s.modal} editing={s.editing} form={s.form}
        formErrors={s.formErrors} setForm={h.setForm} onSave={h.save} onClose={h.closeModal} />

      <ConfirmDialog open={!!s.confirmDeleteId} onConfirm={h.doDelete} onCancel={h.cancelDelete}
        title="Delete action" message="Delete this action permanently?" confirmText="Delete" variant="red" />
    </div>
  )
}
