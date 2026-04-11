'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as XLSX                   from 'xlsx'
import { estudiantesService }      from '../infrastructure/estudiantes.service'
import { StudentMapper }           from './mapper'
import { useToast }                from '@/hooks/useToast'
import { usePagination }           from '@/hooks/usePagination'
import { useDebounce }             from '@/hooks/useDebounce'
import { EMPTY_FORM, EMPTY_FILTERS } from '../domain/types'
import type { StudentViewModel, StudentFormState, StudentFilters, ImportRow } from '../domain/types'
import type { CourseResponse } from '@control-aula/shared'

export function useEstudiantes() {
  const { showToast }                                          = useToast()
  const { page, pageSize, setPage, setPageSize, totalPages, reset } = usePagination()

  const [items,           setItems]           = useState<StudentViewModel[]>([])
  const [courses,         setCourses]         = useState<CourseResponse[]>([])
  const [currentCourse,   setCurrentCourse]   = useState('')
  const [loading,         setLoading]         = useState(true)
  const [modal,           setModal]           = useState(false)
  const [editing,         setEditing]         = useState<StudentViewModel | null>(null)
  const [form,            setForm]            = useState<StudentFormState>(EMPTY_FORM)
  const [search,          setSearch]          = useState('')
  const [filters,         setFilters]         = useState<StudentFilters>(EMPTY_FILTERS)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const fileInputRef                          = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    estudiantesService.getAllCourses().then(data => {
      setCourses(data)
      if (data.length) setCurrentCourse(data[0].id)
    }).catch(() => {})
  }, [])

  const load = useCallback(async (courseId: string) => {
    if (!courseId) return
    try {
      setLoading(true)
      const data = await estudiantesService.getByCourse(courseId)
      setItems(data.map(StudentMapper.toViewModel))
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error loading students', false)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load(currentCourse) }, [currentCourse, load])

  const openCreate = useCallback(() => { setForm(EMPTY_FORM); setEditing(null); setModal(true) }, [])
  const openEdit   = useCallback((item: StudentViewModel) => {
    setForm(StudentMapper.toForm(item)); setEditing(item); setModal(true)
  }, [])

  const save = useCallback(async () => {
    if (!form.name.trim()) { showToast('Student name is required', false); return }
    try {
      const { message } = editing
        ? await estudiantesService.update(editing.id, StudentMapper.toUpdateDto(form))
        : await estudiantesService.create(StudentMapper.toCreateDto(form, currentCourse))
      showToast(message); setModal(false); load(currentCourse)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving student', false)
    }
  }, [form, editing, currentCourse, showToast, load])

  const doDelete = useCallback(async () => {
    if (!confirmDeleteId) return
    try {
      const { message } = await estudiantesService.delete(confirmDeleteId)
      showToast(message); load(currentCourse)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error deleting student', false)
    } finally { setConfirmDeleteId(null) }
  }, [confirmDeleteId, currentCourse, showToast, load])

  const handleExcelUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      showToast('Analizando Excel...', true)
      const buffer    = await file.arrayBuffer()
      const workbook  = XLSX.read(buffer)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData  = XLSX.utils.sheet_to_json(worksheet)
      const parsed: ImportRow[] = (jsonData as Record<string, unknown>[]).map(row => ({
        code:  String(row['CÓDIGO'] ?? row['No'] ?? ''),
        name:  String(row['NOMBRE'] ?? row['Nombre'] ?? ''),
        email: String(row['CORREO'] ?? row['Correo'] ?? ''),
      })).filter(s => s.name)
      if (!parsed.length) throw new Error('No se encontraron columnas de NOMBRE válidas')
      const { data, message } = await estudiantesService.import(currentCourse, parsed)
      showToast(message || `${data.count} estudiantes importados`)
      load(currentCourse)
    } catch (err: unknown) {
      showToast(err instanceof Error ? `Error: ${err.message}` : 'Import error', false)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [currentCourse, showToast, load])

  const maxCoins = useMemo(() =>
    items.length ? Math.max(...items.map(s => s.coins), 0) : 500, [items])

  const filtersActive = filters.coinMin > 0 || filters.coinMax !== null

  const filtered = useMemo(() => items.filter(s => {
    if (debouncedSearch &&
      !s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
      !s.code.toLowerCase().includes(debouncedSearch.toLowerCase())) return false
    if (s.coins < filters.coinMin) return false
    if (filters.coinMax !== null && s.coins > filters.coinMax) return false
    return true
  }), [items, debouncedSearch, filters])

  const paginated = useMemo(
    () => filtered.slice(page * pageSize, (page + 1) * pageSize),
    [filtered, page, pageSize],
  )

  return {
    items: paginated,
    totalItems: filtered.length,
    courses, currentCourse, maxCoins,
    loading, modal, editing, form, search, filters, filtersActive,
    confirmDeleteId, fileInputRef,
    page, pageSize, setPage, setPageSize,
    totalPages: totalPages(filtered.length),
    handlers: {
      openCreate, openEdit, save, doDelete, handleExcelUpload,
      setForm,
      setSearch: (v: string) => { setSearch(v); reset() },
      setFilters: (fn: (p: StudentFilters) => StudentFilters) => { setFilters(fn); reset() },
      clearFilters: () => { setFilters(EMPTY_FILTERS); reset() },
      setCourse: (id: string) => { setCurrentCourse(id); reset() },
      requestDelete: setConfirmDeleteId,
      cancelDelete:  () => setConfirmDeleteId(null),
      closeModal:    () => setModal(false),
    },
  }
}
