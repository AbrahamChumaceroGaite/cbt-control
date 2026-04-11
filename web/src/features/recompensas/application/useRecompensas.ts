'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { recompensasService }                        from '../infrastructure/recompensas.service'
import { RewardMapper }                              from './mapper'
import { useToast }                                  from '@/hooks/useToast'
import { usePagination }                             from '@/hooks/usePagination'
import { useDebounce }                               from '@/hooks/useDebounce'
import { EMPTY_FORM, EMPTY_FILTERS }                 from '../domain/types'
import type { RewardViewModel, RewardFormState, RewardFilters, RewardType } from '../domain/types'

export function useRecompensas() {
  const { showToast }                                            = useToast()
  const { page, pageSize, setPage, setPageSize, totalPages, reset } = usePagination()

  const [items,           setItems]           = useState<RewardViewModel[]>([])
  const [loading,         setLoading]         = useState(true)
  const [modal,           setModal]           = useState(false)
  const [editing,         setEditing]         = useState<RewardViewModel | null>(null)
  const [form,            setForm]            = useState<RewardFormState>(EMPTY_FORM)
  const [search,          setSearch]          = useState('')
  const [filters,         setFilters]         = useState<RewardFilters>(EMPTY_FILTERS)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await recompensasService.getAll()
      setItems(data.map(RewardMapper.toViewModel))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error loading rewards', false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const openCreate = useCallback(() => {
    setForm(EMPTY_FORM); setEditing(null); setModal(true)
  }, [])

  const openEdit = useCallback((item: RewardViewModel) => {
    setForm(RewardMapper.toForm(item)); setEditing(item); setModal(true)
  }, [])

  // Changing type forces isGlobal to match (class = global, individual = not global)
  const changeType = useCallback((t: RewardType) => {
    setForm(p => ({ ...p, type: t, isGlobal: t === 'class' }))
  }, [])

  const save = useCallback(async () => {
    if (!form.name.trim()) { showToast('Reward name is required', false); return }
    try {
      const { message } = editing
        ? await recompensasService.update(editing.id, RewardMapper.toDto(form))
        : await recompensasService.create(RewardMapper.toDto(form))
      showToast(message)
      setModal(false)
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving reward', false)
    }
  }, [form, editing, showToast, load])

  const doDelete = useCallback(async () => {
    if (!confirmDeleteId) return
    try {
      const { message } = await recompensasService.delete(confirmDeleteId)
      showToast(message)
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting reward', false)
    } finally {
      setConfirmDeleteId(null)
    }
  }, [confirmDeleteId, showToast, load])

  const setFilter = useCallback(<K extends keyof RewardFilters>(key: K, value: RewardFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value })); reset()
  }, [reset])

  const filtersActive = filters.type !== 'all' || filters.status !== 'all'

  const filtered = useMemo(() => items.filter(r => {
    if (debouncedSearch && !r.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false
    if (filters.type !== 'all'        && r.type !== filters.type) return false
    if (filters.status === 'active'   && !r.isActive) return false
    if (filters.status === 'inactive' &&  r.isActive) return false
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
    search,
    filters,
    filtersActive,
    confirmDeleteId,
    page, pageSize, setPage, setPageSize,
    totalPages: totalPages(filtered.length),
    handlers: {
      openCreate, openEdit, save, doDelete, changeType,
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
