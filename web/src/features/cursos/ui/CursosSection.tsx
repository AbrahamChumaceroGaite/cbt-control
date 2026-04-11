'use client'
import { BookType } from 'lucide-react'
import { Grid, Tooltip, Button, EmptyState } from '@/components/ui'
import { SectionHeader }  from '@/components/shared/SectionHeader'
import { Pagination }     from '@/components/shared/Pagination'
import { ConfirmDialog }  from '@/components/shared/ConfirmDialog'
import { useCursos }      from '../application/useCursos'
import { CursoCard }      from './CursoCard'
import { CursoFormModal } from './CursoFormModal'

export function CursosSection() {
  const s = useCursos()
  const h = s.handlers

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader
        icon={BookType} iconClass="text-blue-400"
        title="Cursos"
        subtitle="Administra los cursos y niveles."
        search={s.search} onSearch={h.setSearch}
        actions={
          <Tooltip content="Nuevo curso">
            <Button size="sm" onClick={h.openCreate}><span className="text-base leading-none">+</span></Button>
          </Tooltip>
        }
      />

      <Grid cols={3}>
        {s.items.map(c => (
          <CursoCard key={c.id} course={c} onEdit={() => h.openEdit(c)} onDelete={() => h.requestDelete(c.id)} />
        ))}
      </Grid>
      {s.totalItems === 0 && !s.loading && (
        <EmptyState icon={<BookType className="w-5 h-5" />} title="No hay cursos creados." />
      )}

      <div className="mt-4">
        <Pagination page={s.page} totalItems={s.totalItems} pageSize={s.pageSize}
          onPageSizeChange={size => { s.setPageSize(size); s.setPage(0) }} onChange={s.setPage} />
      </div>

      <CursoFormModal open={s.modal} editing={s.editing} form={s.form}
        setForm={h.setForm} onSave={h.save} onClose={h.closeModal} />

      <ConfirmDialog open={!!s.confirmDeleteId} onConfirm={h.doDelete} onCancel={h.cancelDelete}
        title="Eliminar curso"
        message="¿Eliminar este curso y todos sus estudiantes? Esta operación no se puede deshacer."
        confirmText="Eliminar" variant="red" />
    </div>
  )
}
