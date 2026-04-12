'use client'
import { Gift, Plus }      from 'lucide-react'
import { Grid }            from '@/components/ui/grid'
import { Button, Combobox } from '@/components/ui'
import { SectionHeader }   from '@/components/shared/SectionHeader'
import { Pagination }      from '@/components/shared/Pagination'
import { ConfirmDialog }   from '@/components/shared/ConfirmDialog'
import { FilterPopover }   from '@/components/shared/FilterPopover'
import { useRecompensas }  from '../application/useRecompensas'
import { RewardCard }      from './RewardCard'
import { RewardFormModal } from './RewardFormModal'

const TYPE_OPTS = [
  { value: 'all',        label: 'All'        },
  { value: 'class',      label: 'Class'      },
  { value: 'individual', label: 'Individual' },
] as const

const STATUS_OPTS = [
  { value: 'all',      label: 'All'      },
  { value: 'active',   label: 'Active'   },
  { value: 'inactive', label: 'Inactive' },
] as const

export function RecompensasSection() {
  const s = useRecompensas()
  const h = s.handlers

  return (
    <div className="animate-in fade-in duration-300">
      <SectionHeader
        icon={Gift} iconClass="text-amber-400"
        title="Reward Store"
        subtitle="Manage rewards redeemable by class or individual students."
        search={s.search} onSearch={h.setSearch}
        filters={
          <FilterPopover active={s.filtersActive} onClear={h.clearFilters}>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Type</span>
              <Combobox value={s.filters.type}
                onChange={v => h.setFilter('type', v as typeof s.filters.type)}
                options={TYPE_OPTS as unknown as { value: string; label: string }[]} placeholder="All" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Status</span>
              <Combobox value={s.filters.status}
                onChange={v => h.setFilter('status', v as typeof s.filters.status)}
                options={STATUS_OPTS as unknown as { value: string; label: string }[]} placeholder="All" />
            </div>
          </FilterPopover>
        }
        actions={
          <Button size="sm" onClick={h.openCreate}>
            <Plus className="w-3.5 h-3.5" /> New Reward
          </Button>
        }
      />

      <Grid cols={3}>
        {s.items.map(r => (
          <RewardCard key={r.id} reward={r} onEdit={() => h.openEdit(r)} onDelete={() => h.requestDelete(r.id)} />
        ))}
        {s.totalItems === 0 && !s.loading && (
          <p className="col-span-full text-center py-12 text-zinc-500">No rewards found.</p>
        )}
      </Grid>

      <div className="mt-4">
        <Pagination page={s.page} totalItems={s.totalItems} pageSize={s.pageSize}
          onPageSizeChange={size => { s.setPageSize(size); s.setPage(0) }} onChange={s.setPage} />
      </div>

      <RewardFormModal open={s.modal} editing={s.editing} form={s.form}
        setForm={h.setForm} changeType={h.changeType} onSave={h.save} onClose={h.closeModal} />

      <ConfirmDialog open={!!s.confirmDeleteId} onConfirm={h.doDelete} onCancel={h.cancelDelete}
        title="Delete reward"
        message="Delete this reward permanently? This action cannot be undone."
        confirmText="Delete" variant="red" />
    </div>
  )
}
