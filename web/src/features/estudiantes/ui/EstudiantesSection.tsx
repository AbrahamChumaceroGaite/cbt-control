'use client'
import { Users, Upload } from 'lucide-react'
import { Tooltip, Button, EmptyState } from '@/components/ui'
import { SectionHeader }       from '@/components/shared/SectionHeader'
import { Pagination }          from '@/components/shared/Pagination'
import { ConfirmDialog }       from '@/components/shared/ConfirmDialog'
import { CourseSelect }        from '@/components/shared/CourseSelect'
import { FilterPopover }       from '@/components/shared/FilterPopover'
import { useEstudiantes }      from '../application/useEstudiantes'
import { EstudianteRow }       from './EstudianteRow'
import { EstudianteFormModal } from './EstudianteFormModal'
import { CoinRangeFilter }     from './CoinRangeFilter'

export function EstudiantesSection() {
  const s = useEstudiantes()
  const h = s.handlers

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader
        icon={Users} iconClass="text-blue-400"
        title="Directorio de Alumnos"
        subtitle={`${s.totalItems} estudiantes en el curso seleccionado.`}
        search={s.search} onSearch={h.setSearch}
        filters={
          <FilterPopover active={s.filtersActive} onClear={h.clearFilters}>
            <CoinRangeFilter filters={s.filters} maxCoins={s.maxCoins}
              count={s.totalItems} setFilters={h.setFilters} onClear={h.clearFilters} />
          </FilterPopover>
        }
        actions={
          <>
            <CourseSelect courses={s.courses} value={s.currentCourse} onChange={h.setCourse} />
            <Tooltip content="Importar desde Excel (.xlsx)">
              <Button variant="secondary" size="sm" onClick={() => s.fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Importar
              </Button>
            </Tooltip>
            <input type="file" ref={s.fileInputRef} accept=".xlsx,.xls,.csv"
              className="hidden" onChange={h.handleExcelUpload} />
            <Tooltip content="Nuevo alumno">
              <Button size="sm" onClick={h.openCreate}><span className="text-base leading-none">+</span></Button>
            </Tooltip>
          </>
        }
      />

      <div className="card-base border-t-0 rounded-none sm:rounded-xl sm:border-t overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-900/50 text-zinc-400 uppercase text-xs font-semibold tracking-wider border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4">Estudiante</th>
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Correo</th>
              <th className="px-6 py-4 text-right">Coins</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {s.items.map(st => (
              <EstudianteRow key={st.id} student={st}
                onEdit={() => h.openEdit(st)} onDelete={() => h.requestDelete(st.id)} />
            ))}
            {s.totalItems === 0 && !s.loading && (
              <tr><td colSpan={5}><EmptyState icon={<Users className="w-5 h-5" />} title="No se encontraron estudiantes." /></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination page={s.page} totalItems={s.totalItems} pageSize={s.pageSize}
          onPageSizeChange={size => { s.setPageSize(size); s.setPage(0) }} onChange={s.setPage} />
      </div>

      <EstudianteFormModal open={s.modal} editing={s.editing} form={s.form}
        setForm={h.setForm} onSave={h.save} onClose={h.closeModal} />

      <ConfirmDialog open={!!s.confirmDeleteId} onConfirm={h.doDelete} onCancel={h.cancelDelete}
        title="Eliminar estudiante"
        message="¿Eliminar este estudiante? Esta operación no se puede deshacer."
        confirmText="Eliminar" variant="red" />
    </div>
  )
}
