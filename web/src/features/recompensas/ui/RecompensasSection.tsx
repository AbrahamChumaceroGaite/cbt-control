'use client'
import { Gift } from 'lucide-react'
import { Grid }            from '@/components/ui/grid'
import { Tooltip, Button } from '@/components/ui'
import { SectionHeader }   from '@/components/shared/SectionHeader'
import { Pagination }      from '@/components/shared/Pagination'
import { ConfirmDialog }   from '@/components/shared/ConfirmDialog'
import { FilterPopover }   from '@/components/shared/FilterPopover'
import { FilterSelect }    from '@/components/shared/FilterSelect'
import { useRecompensas }  from '../application/useRecompensas'
import { RewardCard }      from './RewardCard'
import { RewardFormModal } from './RewardFormModal'

const TYPE_OPTS = [
  { value: 'all',        label: 'All'             },
  { value: 'class',      label: 'Grupal (Clase)'  },
  { value: 'individual', label: 'Individual'      },
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
        title="Tienda de Recompensas"
        subtitle="Gestiona los premios canjeables por clase o por alumno."
        search={s.search} onSearch={h.setSearch}
        filters={
          <FilterPopover active={s.filtersActive} onClear={h.clearFilters}>
            <FilterSelect label="Tipo" value={s.filters.type}
              onChange={v => h.setFilter('type', v as typeof s.filters.type)} options={TYPE_OPTS} />
            <FilterSelect label="Estado" value={s.filters.status}
              onChange={v => h.setFilter('status', v as typeof s.filters.status)} options={STATUS_OPTS} />
          </FilterPopover>
        }
        actions={
          <Tooltip content="Nueva recompensa">
            <Button size="sm" onClick={h.openCreate}><span className="text-base leading-none">+</span></Button>
          </Tooltip>
        }
      />

      <Grid cols={3}>
        {s.items.map(r => (
          <RewardCard key={r.id} reward={r} onEdit={() => h.openEdit(r)} onDelete={() => h.requestDelete(r.id)} />
        ))}
        {s.totalItems === 0 && !s.loading && (
          <p className="col-span-full text-center py-12 text-zinc-500">Sin recompensas.</p>
        )}
      </Grid>

      <div className="mt-4">
        <Pagination page={s.page} totalItems={s.totalItems} pageSize={s.pageSize}
          onPageSizeChange={size => { s.setPageSize(size); s.setPage(0) }} onChange={s.setPage} />
      </div>

      <RewardFormModal open={s.modal} editing={s.editing} form={s.form}
        setForm={h.setForm} changeType={h.changeType} onSave={h.save} onClose={h.closeModal} />

      <ConfirmDialog open={!!s.confirmDeleteId} onConfirm={h.doDelete} onCancel={h.cancelDelete}
        title="Eliminar recompensa"
        message="¿Eliminar esta recompensa permanentemente? Esta operación no se puede deshacer."
        confirmText="Eliminar" variant="red" />
    </div>
  )
}
