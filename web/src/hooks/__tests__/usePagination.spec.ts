import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from '../usePagination'

vi.mock('@/config/ui', () => ({
  PAGE_SIZE: 10,
}))

describe('usePagination', () => {
  it('starts at page 0 with the default page size', () => {
    const { result } = renderHook(() => usePagination())
    expect(result.current.page).toBe(0)
    expect(result.current.pageSize).toBe(10)
  })

  it('uses a custom initial page size when provided', () => {
    const { result } = renderHook(() => usePagination(5))
    expect(result.current.pageSize).toBe(5)
  })

  it('setPage updates the current page', () => {
    const { result } = renderHook(() => usePagination())
    act(() => { result.current.setPage(3) })
    expect(result.current.page).toBe(3)
  })

  it('reset returns to page 0', () => {
    const { result } = renderHook(() => usePagination())
    act(() => { result.current.setPage(4) })
    act(() => { result.current.reset() })
    expect(result.current.page).toBe(0)
  })

  it('totalPages calculates correctly', () => {
    const { result } = renderHook(() => usePagination())
    expect(result.current.totalPages(0)).toBe(1)
    expect(result.current.totalPages(10)).toBe(1)
    expect(result.current.totalPages(11)).toBe(2)
    expect(result.current.totalPages(25)).toBe(3)
  })

  it('setPageSize updates page size', () => {
    const { result } = renderHook(() => usePagination())
    act(() => { result.current.setPageSize(20) })
    expect(result.current.pageSize).toBe(20)
  })
})
