'use client'
import { Zap } from 'lucide-react'
import { Grid }            from '@/components/ui/grid'
import { Tooltip, Button } from '@/components/ui'
import { SectionHeader }   from '@/components/shared/SectionHeader'
import { Pagination }      from '@/components/shared/Pagination'
import { ConfirmDialog }   from '@/components/shared/ConfirmDialog'
import { FilterPopover }   from '@/components/shared/FilterPopover'
import { FilterSelect }    from '@/components/shared/FilterSelect'
import { useAcciones }     from '../application/useAcciones'
import { ActionCard }      from './ActionCard'
import { ActionFormModal } from './ActionFormModal'
import { ACTION_CATEGORIES } from '../domain/types'

const STATUS_OPTS = [
  { value: 'all',      label: 'All'      },
  { value: 'active',   label: 'Active'   },
  { value: 'inactive', label: 'Inactive' },
] as const

const SCOPE_OPTS = [
  { value: 'all',     label: 'All'            },
  { value: 'class',   label: 'Class only'     },
  { value: 'student', label: 'Student only'   },
] as const

export function AccionesSection() {
  const s = useAcciones()
  const h = s.handlers

  return (
    <div className="animate-in fade-in duration-300">
      <SectionHeader
        icon={Zap} iconClass="text-amber-400"
        title="Catálogo de Acciones"
        subtitle="Configura los comportamientos y sus puntajes."
        search={s.search} onSearch={h.setSearch}
        filters={
          <FilterPopover active={s.filtersActive} onClear={h.clearFilters}>
            <FilterSelect label="Categoría" value={s.filters.category} onChange={v => h.setFilter('category', v)}
              options={[{ value: 'all', label: 'All' }, ...ACTION_CATEGORIES]} />
            <FilterSelect label="Estado" value={s.filters.status}
              onChange={v => h.setFilter('status', v as typeof s.filters.status)} options={STATUS_OPTS} />
            <FilterSelect label="Alcance" value={s.filters.scope}
              onChange={v => h.setFilter('scope', v as typeof s.filters.scope)} options={SCOPE_OPTS} />
          </FilterPopover>
        }
        actions={
          <Tooltip content="Nueva acción">
            <Button size="sm" onClick={h.openCreate}><span className="text-base leading-none">+</span></Button>
          </Tooltip>
        }
      />

      <Grid cols={3}>
        {s.items.map(a => (
          <ActionCard key={a.id} action={a} onEdit={() => h.openEdit(a)} onDelete={() => h.requestDelete(a.id)} />
        ))}
        {s.totalItems === 0 && !s.loading && (
          <p className="col-span-full text-center py-12 text-zinc-500">Sin acciones.</p>
        )}
      </Grid>

      <div className="mt-4">
        <Pagination page={s.page} totalItems={s.totalItems} pageSize={s.pageSize}
          onPageSizeChange={size => { s.setPageSize(size); s.setPage(0) }} onChange={s.setPage} />
      </div>

      <ActionFormModal open={s.modal} editing={s.editing} form={s.form}
        setForm={h.setForm} onSave={h.save} onClose={h.closeModal} />

      <ConfirmDialog open={!!s.confirmDeleteId} onConfirm={h.doDelete} onCancel={h.cancelDelete}
        title="Eliminar acción" message="¿Eliminar esta acción permanentemente?" confirmText="Eliminar" variant="red" />
    </div>
  )
}
