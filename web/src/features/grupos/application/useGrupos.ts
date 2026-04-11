'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { gruposService }                             from '../infrastructure/grupos.service'
import { GroupMapper }                               from './mapper'
import { useToast }                                  from '@/hooks/useToast'
import { usePagination }                             from '@/hooks/usePagination'
import { EMPTY_FORM }                                from '../domain/types'
import type { GroupViewModel, GroupFormState } from '../domain/types'
import type { CourseResponse, StudentResponse } from '@control-aula/shared'

export function useGrupos() {
  const { showToast }                                          = useToast()
  const { page, pageSize, setPage, setPageSize, totalPages } = usePagination()

  const [items,           setItems]           = useState<GroupViewModel[]>([])
  const [courses,         setCourses]         = useState<CourseResponse[]>([])
  const [students,        setStudents]        = useState<StudentResponse[]>([])
  const [currentCourse,   setCurrentCourse]   = useState('')
  const [loading,         setLoading]         = useState(true)
  const [modal,           setModal]           = useState(false)
  const [editing,         setEditing]         = useState<GroupViewModel | null>(null)
  const [form,            setForm]            = useState<GroupFormState>(EMPTY_FORM)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Load courses once — picks first course as default
  useEffect(() => {
    gruposService.getAllCourses().then(data => {
      setCourses(data)
      if (data.length) setCurrentCourse(data[0].id)
    }).catch(() => {})
  }, [])

  const loadGroups = useCallback(async (courseId: string) => {
    if (!courseId) return
    try {
      setLoading(true)
      const [grps, stds] = await Promise.all([
        gruposService.getByCourse(courseId),
        gruposService.getStudentsByCourse(courseId),
      ])
      setItems(grps.map(GroupMapper.toViewModel))
      setStudents(stds)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error loading groups', false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadGroups(currentCourse) }, [currentCourse, loadGroups])

  const openCreate = useCallback(() => {
    setForm(EMPTY_FORM); setEditing(null); setModal(true)
  }, [])

  const openEdit = useCallback((item: GroupViewModel) => {
    setForm(GroupMapper.toForm(item)); setEditing(item); setModal(true)
  }, [])

  const toggleMember = useCallback((studentId: string) => {
    setForm(p => ({
      ...p,
      studentIds: p.studentIds.includes(studentId)
        ? p.studentIds.filter(id => id !== studentId)
        : [...p.studentIds, studentId],
    }))
  }, [])

  const save = useCallback(async () => {
    if (!form.name.trim()) { showToast('Group name is required', false); return }
    try {
      const dto = GroupMapper.toDto(form, currentCourse)
      const { message } = editing
        ? await gruposService.update(editing.id, dto)
        : await gruposService.create(dto)
      showToast(message)
      setModal(false)
      loadGroups(currentCourse)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving group', false)
    }
  }, [form, editing, currentCourse, showToast, loadGroups])

  const doDelete = useCallback(async () => {
    if (!confirmDeleteId) return
    try {
      const { message } = await gruposService.delete(confirmDeleteId)
      showToast(message)
      loadGroups(currentCourse)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting group', false)
    } finally {
      setConfirmDeleteId(null)
    }
  }, [confirmDeleteId, currentCourse, showToast, loadGroups])

  const paginated = useMemo(
    () => items.slice(page * pageSize, (page + 1) * pageSize),
    [items, page, pageSize],
  )

  return {
    items: paginated,
    totalItems: items.length,
    courses, students, currentCourse,
    loading, modal, editing, form,
    confirmDeleteId,
    page, pageSize, setPage, setPageSize,
    totalPages: totalPages(items.length),
    handlers: {
      openCreate, openEdit, save, doDelete, toggleMember,
      setForm,
      setCourse: (id: string) => { setCurrentCourse(id); setPage(0) },
      requestDelete: setConfirmDeleteId,
      cancelDelete:  () => setConfirmDeleteId(null),
      closeModal:    () => setModal(false),
    },
  }
}
