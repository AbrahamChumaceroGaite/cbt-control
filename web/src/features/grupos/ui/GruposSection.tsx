'use client'
import { Network, Plus }                      from 'lucide-react'
import { Grid, Button, EmptyState, Combobox } from '@/components/ui'
import { SectionHeader }                      from '@/components/shared/SectionHeader'
import { Pagination }                         from '@/components/shared/Pagination'
import { ConfirmDialog }                      from '@/components/shared/ConfirmDialog'
import { useGrupos }                          from '../application/useGrupos'
import { GroupCard }                          from './GroupCard'
import { GroupFormModal }                     from './GroupFormModal'

export function GruposSection() {
  const s = useGrupos()
  const h = s.handlers

  const courseOptions = s.courses.map(c => ({ value: c.id, label: c.name }))

  return (
    <div className="animate-in fade-in duration-500">
      <SectionHeader
        icon={Network} iconClass="text-purple-400"
        title="Work Groups"
        subtitle="Manage teams in the selected course."
        actions={
          <>
            <Combobox
              value={s.currentCourse}
              onChange={h.setCourse}
              options={courseOptions}
              placeholder="Select course…"
              className="w-44"
            />
            <Button size="sm" onClick={h.openCreate}>
              <Plus className="w-3.5 h-3.5" /> New Group
            </Button>
          </>
        }
      />

      <Grid cols={3}>
        {s.items.map(g => (
          <GroupCard key={g.id} group={g} onEdit={() => h.openEdit(g)} onDelete={() => h.requestDelete(g.id)} />
        ))}
      </Grid>
      {s.totalItems === 0 && !s.loading && (
        <EmptyState icon={<Network className="w-5 h-5" />} title="No groups found in this course." />
      )}

      <div className="mt-4">
        <Pagination page={s.page} totalItems={s.totalItems} pageSize={s.pageSize}
          onPageSizeChange={size => { s.setPageSize(size); s.setPage(0) }} onChange={s.setPage} />
      </div>

      <GroupFormModal open={s.modal} editing={s.editing} form={s.form}
        formErrors={s.formErrors} students={s.students} setForm={h.setForm}
        toggleMember={h.toggleMember} onSave={h.save} onClose={h.closeModal} />

      <ConfirmDialog open={!!s.confirmDeleteId} onConfirm={h.doDelete} onCancel={h.cancelDelete}
        title="Delete group"
        message="Delete this group? Students will not be removed."
        confirmText="Delete" variant="red" />
    </div>
  )
}
