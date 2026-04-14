'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { accionesService }                           from '../infrastructure/acciones.service'
import { ActionMapper }                              from './mapper'
import { useToast }                                  from '@/hooks/useToast'
import { usePagination }                             from '@/hooks/usePagination'
import { useDebounce }                               from '@/hooks/useDebounce'
import { EMPTY_FORM, EMPTY_FILTERS }                 from '../domain/types'
import type { ActionViewModel, ActionFormState, ActionFilters } from '../domain/types'
import { ErrorCode, ERROR_MESSAGES }                 from '@control-aula/shared'

export function useAcciones() {
  const { showToast }                                            = useToast()
  const { page, pageSize, setPage, setPageSize, totalPages, reset } = usePagination()

  const [items,           setItems]           = useState<ActionViewModel[]>([])
  const [loading,         setLoading]         = useState(true)
  const [modal,           setModal]           = useState(false)
  const [editing,         setEditing]         = useState<ActionViewModel | null>(null)
  const [form,            setForm]            = useState<ActionFormState>(EMPTY_FORM)
  const [search,          setSearch]          = useState('')
  const [filters,         setFilters]         = useState<ActionFilters>(EMPTY_FILTERS)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [formErrors,      setFormErrors]      = useState<{ name?: string; coins?: string }>({})

  const debouncedSearch = useDebounce(search)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await accionesService.getAll()
      setItems(data.map(ActionMapper.toViewModel))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error loading actions', false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const openCreate = useCallback(() => {
    setForm(EMPTY_FORM); setEditing(null); setModal(true)
  }, [])

  const openEdit = useCallback((item: ActionViewModel) => {
    setForm(ActionMapper.toForm(item)); setEditing(item); setModal(true)
  }, [])

  const save = useCallback(async () => {
    setFormErrors({})
    if (!form.name.trim())
      return setFormErrors({ name: ERROR_MESSAGES[ErrorCode.ACTION_NAME_TOO_SHORT] })
    if (form.coins === 0)
      return setFormErrors({ coins: ERROR_MESSAGES[ErrorCode.ACTION_COINS_ZERO] })
    try {
      const { message } = editing
        ? await accionesService.update(editing.id, ActionMapper.toDto(form))
        : await accionesService.create(ActionMapper.toDto(form))
      showToast(message)
      setModal(false)
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving action', false)
    }
  }, [form, editing, showToast, load])

  const doDelete = useCallback(async () => {
    if (!confirmDeleteId) return
    try {
      const { message } = await accionesService.delete(confirmDeleteId)
      showToast(message)
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting action', false)
    } finally {
      setConfirmDeleteId(null)
    }
  }, [confirmDeleteId, showToast, load])

  const setFilter = useCallback(<K extends keyof ActionFilters>(key: K, value: ActionFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value })); reset()
  }, [reset])

  const filtersActive = filters.category !== 'all' || filters.status !== 'all' || filters.scope !== 'all'

  const filtered = useMemo(() => items.filter(a => {
    if (debouncedSearch && !a.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false
    if (filters.category !== 'all' && a.category !== filters.category) return false
    if (filters.status === 'active'   && !a.isActive) return false
    if (filters.status === 'inactive' &&  a.isActive) return false
    if (filters.scope === 'class'     && !a.affectsClass)   return false
    if (filters.scope === 'student'   && !a.affectsStudent) return false
    return true
  }), [items, debouncedSearch, filters])

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
    filters,
    filtersActive,
    confirmDeleteId,
    page, pageSize, setPage, setPageSize,
    totalPages: totalPages(filtered.length),
    handlers: {
      openCreate, openEdit, save, doDelete,
      setForm,
      setSearch: (v: string) => { setSearch(v); reset() },
      setFilter,
      clearFilters: () => { setFilters(EMPTY_FILTERS); reset() },
      requestDelete: setConfirmDeleteId,
      cancelDelete:  () => setConfirmDeleteId(null),
      closeModal:    () => setModal(false),
    },
  }
}
