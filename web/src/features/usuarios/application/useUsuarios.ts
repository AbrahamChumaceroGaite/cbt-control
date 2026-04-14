'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usuariosService }  from '../infrastructure/usuarios.service'
import { UserMapper }       from './mapper'
import { useToast }         from '@/hooks/useToast'
import { usePagination }    from '@/hooks/usePagination'
import { useDebounce }      from '@/hooks/useDebounce'
import type { UserViewModel, UserCreateForm, UserFilters } from '../domain/types'
import { EMPTY_CREATE_FORM, EMPTY_FILTERS } from '../domain/types'
import { ErrorCode, ERROR_MESSAGES }        from '@control-aula/shared'

export function useUsuarios() {
  const { showToast }                             = useToast()
  const { page, pageSize, setPage, setPageSize, reset } = usePagination()

  const [items,       setItems]       = useState<UserViewModel[]>([])
  const [modal,       setModal]       = useState(false)
  const [form,        setForm]        = useState<UserCreateForm>(EMPTY_CREATE_FORM)
  const [search,      setSearch]      = useState('')
  const [filters,     setFilters]     = useState<UserFilters>(EMPTY_FILTERS)
  const [selected,    setSelected]    = useState<UserViewModel | null>(null)
  const [formErrors,  setFormErrors]  = useState<{ code?: string; fullName?: string }>({})

  const debouncedSearch = useDebounce(search)

  const load = useCallback(async () => {
    try {
      const data = await usuariosService.getAll()
      setItems(data.map(UserMapper.toViewModel))
    } catch {
      // Silent — list failure should not block other UI
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Derived filtering ─────────────────────────────────────────────────────

  const courseOptions = useMemo(
    () => Array.from(
      new Set(items.map(u => u.student?.course?.name).filter(Boolean) as string[])
    ).sort(),
    [items],
  )

  const filtered = useMemo(() => {
    return items.filter(u => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase()
        if (!u.code.toLowerCase().includes(q) && !u.displayName.toLowerCase().includes(q)) return false
      }
      if (filters.role !== 'all'    && u.role !== filters.role)    return false
      if (filters.status === 'active'   && !u.isActive)            return false
      if (filters.status === 'inactive' &&  u.isActive)            return false
      if (filters.push === 'active'   && !u.hasPush)               return false
      if (filters.push === 'inactive' &&  u.hasPush)               return false
      if (filters.course && u.student?.course?.name !== filters.course) return false
      if (filters.from && new Date(u.createdAt) < new Date(filters.from))          return false
      if (filters.to   && new Date(u.createdAt) > new Date(`${filters.to}T23:59:59`)) return false
      return true
    })
  }, [items, debouncedSearch, filters])

  const paginated = useMemo(
    () => filtered.slice(page * pageSize, (page + 1) * pageSize),
    [filtered, page, pageSize],
  )

  const filtersActive = useMemo(() => (
    filters.role !== 'all' || filters.status !== 'all' || filters.push !== 'all' ||
    filters.course !== '' || filters.from !== '' || filters.to !== ''
  ), [filters])

  // ── Actions ───────────────────────────────────────────────────────────────

  const create = useCallback(async () => {
    setFormErrors({})
    if (!form.code.trim())
      return setFormErrors({ code: ERROR_MESSAGES[ErrorCode.USER_CODE_REQUIRED] })
    if (!form.fullName.trim())
      return setFormErrors({ fullName: ERROR_MESSAGES[ErrorCode.USER_NAME_REQUIRED] })
    try {
      const { message } = await usuariosService.create(UserMapper.toCreateDto(form))
      showToast(message)
      setModal(false)
      setForm(EMPTY_CREATE_FORM)
      load()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Connection error', false)
    }
  }, [form, load, showToast])

  const updateFilter = useCallback(<K extends keyof UserFilters>(key: K, value: UserFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    reset()
  }, [reset])

  const clearFilters = useCallback(() => { setFilters(EMPTY_FILTERS); reset() }, [reset])

  return {
    paginated, filtered, filters, filtersActive, courseOptions,
    modal, form, formErrors, search, page, pageSize, selected,
    setPage, setPageSize,
    handlers: {
      openCreate:    () => { setForm(EMPTY_CREATE_FORM); setModal(true) },
      closeCreate:   () => setModal(false),
      setForm,
      create,
      setSearch:     (v: string) => { setSearch(v); reset() },
      updateFilter,
      clearFilters,
      selectUser:    setSelected,
      closeDrawer:   () => setSelected(null),
      onUserUpdated: () => { load(); setSelected(null) },
      reload:        load,
    },
  }
}
