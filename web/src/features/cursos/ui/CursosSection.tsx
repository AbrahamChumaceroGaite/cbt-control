'use client'
import { BookType, Plus } from 'lucide-react'
import { Grid, Button, EmptyState } from '@/components/ui'
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
        title="Courses"
        subtitle="Manage courses and academic levels."
        search={s.search} onSearch={h.setSearch}
        actions={
          <Button size="sm" onClick={h.openCreate}>
            <Plus className="w-3.5 h-3.5" /> New Course
          </Button>
        }
      />

      <Grid cols={3}>
        {s.items.map(c => (
          <CursoCard key={c.id} course={c} onEdit={() => h.openEdit(c)} onDelete={() => h.requestDelete(c.id)} />
        ))}
      </Grid>
      {s.totalItems === 0 && !s.loading && (
        <EmptyState icon={<BookType className="w-5 h-5" />} title="No courses found." />
      )}

      <div className="mt-4">
        <Pagination page={s.page} totalItems={s.totalItems} pageSize={s.pageSize}
          onPageSizeChange={size => { s.setPageSize(size); s.setPage(0) }} onChange={s.setPage} />
      </div>

      <CursoFormModal open={s.modal} editing={s.editing} form={s.form}
        formErrors={s.formErrors} setForm={h.setForm} onSave={h.save} onClose={h.closeModal} />

      <ConfirmDialog open={!!s.confirmDeleteId} onConfirm={h.doDelete} onCancel={h.cancelDelete}
        title="Delete course"
        message="Delete this course and all its students? This action cannot be undone."
        confirmText="Delete" variant="red" />
    </div>
  )
}
