'use client'
import { Network } from 'lucide-react'
import { Grid, Tooltip, Button, EmptyState } from '@/components/ui'
import { SectionHeader }   from '@/components/shared/SectionHeader'
import { Pagination }      from '@/components/shared/Pagination'
import { ConfirmDialog }   from '@/components/shared/ConfirmDialog'
import { CourseSelect }    from '@/components/shared/CourseSelect'
import { useGrupos }       from '../application/useGrupos'
import { GroupCard }       from './GroupCard'
import { GroupFormModal }  from './GroupFormModal'

export function GruposSection() {
  const s = useGrupos()
  const h = s.handlers

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader
        icon={Network} iconClass="text-purple-400"
        title="Grupos de Trabajo"
        subtitle="Gestiona los equipos en el curso seleccionado."
        actions={
          <>
            <CourseSelect courses={s.courses} value={s.currentCourse} onChange={h.setCourse} />
            <Tooltip content="Nuevo grupo">
              <Button size="sm" onClick={h.openCreate}><span className="text-base leading-none">+</span></Button>
            </Tooltip>
          </>
        }
      />

      <Grid cols={3}>
        {s.items.map(g => (
          <GroupCard key={g.id} group={g} onEdit={() => h.openEdit(g)} onDelete={() => h.requestDelete(g.id)} />
        ))}
      </Grid>
      {s.totalItems === 0 && !s.loading && (
        <EmptyState icon={<Network className="w-5 h-5" />} title="No hay grupos creados en este curso." />
      )}

      <div className="mt-4">
        <Pagination page={s.page} totalItems={s.totalItems} pageSize={s.pageSize}
          onPageSizeChange={size => { s.setPageSize(size); s.setPage(0) }} onChange={s.setPage} />
      </div>

      <GroupFormModal open={s.modal} editing={s.editing} form={s.form}
        students={s.students} setForm={h.setForm} toggleMember={h.toggleMember}
        onSave={h.save} onClose={h.closeModal} />

      <ConfirmDialog open={!!s.confirmDeleteId} onConfirm={h.doDelete} onCancel={h.cancelDelete}
        title="Eliminar grupo"
        message="¿Eliminar este grupo? Los estudiantes no serán eliminados."
        confirmText="Eliminar" variant="red" />
    </div>
  )
}
