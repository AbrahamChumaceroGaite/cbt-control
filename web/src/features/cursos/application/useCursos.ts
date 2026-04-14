'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { cursosService }                             from '../infrastructure/cursos.service'
import { CourseMapper }                              from './mapper'
import { useToast }                                  from '@/hooks/useToast'
import { usePagination }                             from '@/hooks/usePagination'
import { useDebounce }                               from '@/hooks/useDebounce'
import { EMPTY_FORM }                                from '../domain/types'
import type { CourseViewModel, CourseFormState } from '../domain/types'
import { ErrorCode, ERROR_MESSAGES }            from '@control-aula/shared'

export function useCursos() {
  const { showToast }                                          = useToast()
  const { page, pageSize, setPage, setPageSize, totalPages, reset } = usePagination()

  const [items,           setItems]           = useState<CourseViewModel[]>([])
  const [loading,         setLoading]         = useState(true)
  const [modal,           setModal]           = useState(false)
  const [editing,         setEditing]         = useState<CourseViewModel | null>(null)
  const [form,            setForm]            = useState<CourseFormState>(EMPTY_FORM)
  const [search,          setSearch]          = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [formErrors,      setFormErrors]      = useState<{ name?: string; level?: string; parallel?: string }>({})

  const debouncedSearch = useDebounce(search)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await cursosService.getAll()
      setItems(data.map(CourseMapper.toViewModel))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error loading courses', false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const openCreate = useCallback(() => {
    setForm(EMPTY_FORM); setEditing(null); setModal(true)
  }, [])

  const openEdit = useCallback((item: CourseViewModel) => {
    setForm(CourseMapper.toForm(item)); setEditing(item); setModal(true)
  }, [])

  const save = useCallback(async () => {
    setFormErrors({})
    if (!form.name.trim())
      return setFormErrors({ name: ERROR_MESSAGES[ErrorCode.COURSE_NAME_TOO_SHORT] })
    if (!form.level.trim())
      return setFormErrors({ level: ERROR_MESSAGES[ErrorCode.COURSE_LEVEL_REQUIRED] })
    if (!form.parallel.trim())
      return setFormErrors({ parallel: ERROR_MESSAGES[ErrorCode.COURSE_PARALLEL_REQUIRED] })
    try {
      const { message } = editing
        ? await cursosService.update(editing.id, CourseMapper.toDto(form))
        : await cursosService.create(CourseMapper.toDto(form))
      showToast(message)
      setModal(false)
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving course', false)
    }
  }, [form, editing, showToast, load])

  const doDelete = useCallback(async () => {
    if (!confirmDeleteId) return
    try {
      const { message } = await cursosService.delete(confirmDeleteId)
      showToast(message)
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting course', false)
    } finally {
      setConfirmDeleteId(null)
    }
  }, [confirmDeleteId, showToast, load])

  const filtered = useMemo(() =>
    debouncedSearch
      ? items.filter(c => c.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      : items,
    [items, debouncedSearch],
  )

  const paginated = useMemo(
    () => filtered.slice(page * pageSize, (page + 1) * pageSize),
    [filtered, page, pageSize],
  )

  return {
    items: paginated,
    totalItems: filtered.length,
    loading,
    modal,
    editing,
    form,
    formErrors,
    search,
    confirmDeleteId,
    page, pageSize, setPage, setPageSize,
    totalPages: totalPages(filtered.length),
    handlers: {
      openCreate, openEdit, save, doDelete,
      setForm,
      setSearch: (v: string) => { setSearch(v); reset() },
      requestDelete: setConfirmDeleteId,
      cancelDelete:  () => setConfirmDeleteId(null),
      closeModal:    () => setModal(false),
    },
  }
}
